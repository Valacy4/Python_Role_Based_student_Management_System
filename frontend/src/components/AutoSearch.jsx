// src/components/AutoSearch.jsx
import { useState, useEffect, useRef } from 'react'

export default function AutoSearch({
  placeholder = 'Search...',
  items = [],           // full list to search through
  searchKeys = [],      // which fields to match e.g. ['full_name', 'roll_number']
  onSelect,             // called when user clicks a suggestion
  onSearch,             // called on every keystroke with filtered results
  storageKey = 'search_history',  // unique key per page
}) {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [history,     setHistory]     = useState([])
  const [showDrop,    setShowDrop]    = useState(false)
  const [focused,     setFocused]     = useState(false)
  const inputRef = useRef(null)
  const dropRef  = useRef(null)

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      setHistory(saved ? JSON.parse(saved) : [])
    } catch {
      setHistory([])
    }
  }, [storageKey])

  // Close dropdown when clicking outside
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
      onSearch && onSearch('')
      return
    }

    // Filter items based on searchKeys
    const matched = items.filter(item =>
      searchKeys.some(key =>
        String(item[key] || '').toLowerCase().includes(val.toLowerCase())
      )
    ).slice(0, 6)

    setSuggestions(matched)
    onSearch && onSearch(val)
  }

  const handleSelect = (item) => {
    const displayVal = item[searchKeys[0]] || ''
    setQuery(displayVal)
    setSuggestions([])
    setShowDrop(false)
    saveToHistory(displayVal)
    onSelect && onSelect(item)
    onSearch && onSearch(displayVal)
  }

  const handleHistoryClick = (term) => {
    setQuery(term)
    setShowDrop(false)
    onSearch && onSearch(term)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveToHistory(query)
      setShowDrop(false)
      onSearch && onSearch(query)
    }
    if (e.key === 'Escape') {
      setShowDrop(false)
    }
  }

  const showHistory  = focused && query === '' && history.length > 0
  const showSuggest  = focused && query !== '' && suggestions.length > 0
  const showDropdown = showHistory || showSuggest

  return (
    <div style={styles.wrapper}>
      <div style={styles.inputRow}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { setFocused(true); setShowDrop(true) }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={styles.input}
        />
        {query && (
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => {
              setQuery('')
              setSuggestions([])
              onSearch && onSearch('')
            }}
            style={styles.clearBtn}
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div ref={dropRef} style={styles.dropdown}>

          {/* Search history */}
          {showHistory && (
            <>
              <div style={styles.dropHeader}>
                <span>Recent searches</span>
                <button onMouseDown={e => e.preventDefault()}
                  onClick={clearHistory} style={styles.clearHistBtn}>
                  Clear
                </button>
              </div>
              {history.map((term, idx) => (
                <div
                  key={idx}
                  style={styles.dropItem}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleHistoryClick(term)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={styles.histIcon}>🕐</span>
                  <span style={styles.dropText}>{term}</span>
                </div>
              ))}
            </>
          )}

          {/* Auto suggestions */}
          {showSuggest && (
            <>
              <div style={styles.dropHeader}>
                <span>Suggestions</span>
              </div>
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  style={styles.dropItem}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={styles.suggestIcon}>👤</span>
                  <div>
                    <div style={styles.dropText}>
                      {/* Highlight matching part */}
                      {highlightMatch(String(item[searchKeys[0]] || ''), query)}
                    </div>
                    {searchKeys[1] && (
                      <div style={styles.dropSub}>
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

// Highlight the matching part of text in bold
function highlightMatch(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <strong style={{color:'#4f46e5'}}>{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  )
}

const styles = {
  wrapper:      { position:'relative', flex:1 },
  inputRow:     { display:'flex', alignItems:'center', border:'1px solid #e2e8f0',
                  borderRadius:'8px', backgroundColor:'#fff', overflow:'hidden' },
  searchIcon:   { padding:'0 10px', fontSize:'14px' },
  input:        { flex:1, padding:'9px 8px', border:'none', outline:'none',
                  fontSize:'14px', backgroundColor:'transparent' },
  clearBtn:     { background:'none', border:'none', padding:'0 10px',
                  cursor:'pointer', color:'#94a3b8', fontSize:'14px' },
  dropdown:     { position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
                  backgroundColor:'#fff', border:'1px solid #e2e8f0', borderRadius:'8px',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.08)', zIndex:100, overflow:'hidden' },
  dropHeader:   { display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'8px 14px', fontSize:'11px', fontWeight:'600',
                  color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em',
                  borderBottom:'1px solid #f1f5f9' },
  clearHistBtn: { background:'none', border:'none', cursor:'pointer',
                  color:'#94a3b8', fontSize:'11px', padding:0 },
  dropItem:     { display:'flex', alignItems:'center', gap:'10px',
                  padding:'10px 14px', cursor:'pointer', transition:'background 0.1s' },
  histIcon:     { fontSize:'13px', flexShrink:0 },
  suggestIcon:  { fontSize:'13px', flexShrink:0 },
  dropText:     { fontSize:'14px', color:'#0f172a' },
  dropSub:      { fontSize:'12px', color:'#94a3b8', marginTop:'2px' },
}