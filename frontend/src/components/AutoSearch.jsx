// src/components/AutoSearch.jsx
import { useState, useEffect, useRef } from 'react'

export default function AutoSearch({
  placeholder = 'Search...',
  items = [],
  searchKeys = [],
  onSelect,
  onSearch,
  storageKey = 'search_history',
}) {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [history,     setHistory]     = useState([])
  const [showDrop,    setShowDrop]    = useState(false)
  const [focused,     setFocused]     = useState(false)
  const inputRef = useRef(null)
  const dropRef  = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      setHistory(saved ? JSON.parse(saved) : [])
    } catch { setHistory([]) }
  }, [storageKey])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target) &&
          !inputRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const saveToHistory = (term) => {
    if (!term.trim()) return
    const updated = [term, ...history.filter(h => h !== term)].slice(0, 8)
    setHistory(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(storageKey)
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setShowDrop(true)
    if (val.trim() === '') {
      setSuggestions([])
      onSearch?.('')
      return
    }
    const matched = items.filter(item =>
      searchKeys.some(key =>
        String(item[key] || '').toLowerCase().includes(val.toLowerCase())
      )
    ).slice(0, 6)
    setSuggestions(matched)
    onSearch?.(val)
  }

  const handleSelect = (item) => {
    const displayVal = item[searchKeys[0]] || ''
    setQuery(displayVal)
    setSuggestions([])
    setShowDrop(false)
    saveToHistory(displayVal)
    onSelect?.(item)
    onSearch?.(displayVal)
  }

  const handleHistoryClick = (term) => {
    setQuery(term)
    setShowDrop(false)
    onSearch?.(term)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { saveToHistory(query); setShowDrop(false); onSearch?.(query) }
    if (e.key === 'Escape') setShowDrop(false)
  }

  const showHistory  = focused && query === '' && history.length > 0
  const showSuggest  = focused && query !== '' && suggestions.length > 0
  const showDropdown = showHistory || showSuggest

  return (
    <div className="relative flex-1">

      {/* Input row */}
      <div className="flex items-center
        border border-gray-200 dark:border-gray-700
        rounded-lg overflow-hidden
        bg-white dark:bg-gray-800
        focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent
        transition-shadow">

        <span className="px-2.5 text-sm select-none">🔍</span>

        {/* FIX: was `style={{ backgroundColor:'transparent' }}` — transparent on a
            white parent meant white bg, invisible white text cursor in dark mode.
            Now the parent div is dark:bg-gray-800 and the input is fully transparent
            with explicit dark:text-gray-100 and dark:placeholder-gray-500 so both
            typed text AND the caret are visible in dark mode. */}
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { setFocused(true); setShowDrop(true) }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 py-2 pr-2 bg-transparent border-none outline-none
            text-sm
            text-gray-800 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            caret-gray-800 dark:caret-gray-100"
        />

        {query && (
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => { setQuery(''); setSuggestions([]); onSearch?.('') }}
            className="px-2.5 text-gray-400 dark:text-gray-500
              hover:text-gray-600 dark:hover:text-gray-300
              bg-transparent border-none cursor-pointer text-sm transition-colors">
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div ref={dropRef}
          className="absolute top-[calc(100%+4px)] left-0 right-0 z-[100]
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg overflow-hidden">

          {/* Search history */}
          {showHistory && (
            <>
              <div className="flex justify-between items-center
                px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider
                text-gray-400 dark:text-gray-500
                border-b border-gray-100 dark:border-gray-700">
                <span>Recent searches</span>
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={clearHistory}
                  className="bg-transparent border-none cursor-pointer
                    text-[11px] text-gray-400 dark:text-gray-500
                    hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  Clear
                </button>
              </div>
              {history.map((term, idx) => (
                <div key={idx}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleHistoryClick(term)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer
                    hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-[13px]">🕐</span>
                  <span className="text-sm text-gray-800 dark:text-gray-200">{term}</span>
                </div>
              ))}
            </>
          )}

          {/* Suggestions */}
          {showSuggest && (
            <>
              <div className="flex justify-between items-center
                px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider
                text-gray-400 dark:text-gray-500
                border-b border-gray-100 dark:border-gray-700">
                <span>Suggestions</span>
              </div>
              {suggestions.map((item, idx) => (
                <div key={idx}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer
                    hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-[13px]">👤</span>
                  <div>
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                      {highlightMatch(String(item[searchKeys[0]] || ''), query)}
                    </div>
                    {searchKeys[1] && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {item[searchKeys[1]]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function highlightMatch(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <strong className="text-indigo-500 dark:text-indigo-400 font-semibold">
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </>
  )
}