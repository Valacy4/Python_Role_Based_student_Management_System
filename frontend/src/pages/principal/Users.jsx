// src/pages/principal/Users.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Pencil } from 'lucide-react'
import API from '../../api/axios'
import AutoSearch from '../../components/AutoSearch'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonTable } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const PAGE_SIZE = 20

const ROLE_META = {
  principal: { color: '#7c3aed', bg: '#f5f3ff', label: 'Principal' },
  hod:       { color: '#d97706', bg: '#fef3c7', label: 'HOD'       },
  teacher:   { color: '#0d9488', bg: '#ccfbf1', label: 'Teacher'   },
  student:   { color: '#2563eb', bg: '#dbeafe', label: 'Student'   },
}

export default function PrincipalUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [sortBy,  setSortBy]  = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page,    setPage]    = useState(1)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    API.get('/auth/users/')
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (location.state?.success) {
      toast.success(location.state.success)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  useEffect(() => { setPage(1) }, [search, filter, sortBy, sortDir])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await API.delete(`/auth/users/${id}/`)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success('User deleted.')
    } catch {
      toast.error('Failed to delete user.')
    }
  }

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('asc') }
  }

  const counts = {
    all:       users.length,
    principal: users.filter(u => u.role === 'principal').length,
    hod:       users.filter(u => u.role === 'hod').length,
    teacher:   users.filter(u => u.role === 'teacher').length,
    student:   users.filter(u => u.role === 'student').length,
  }

  const afterFilter = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch =
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name  || '').toLowerCase().includes(q) ||
      (u.email      || '').toLowerCase().includes(q) ||
      (u.username   || '').toLowerCase().includes(q)
    return matchSearch && (filter === 'all' || u.role === filter)
  })

  const afterSort = [...afterFilter].sort((a, b) => {
    let aVal, bVal
    switch (sortBy) {
      case 'name':     aVal = `${a.first_name} ${a.last_name}`.toLowerCase(); bVal = `${b.first_name} ${b.last_name}`.toLowerCase(); break
      case 'email':    aVal = (a.email    || '').toLowerCase(); bVal = (b.email    || '').toLowerCase(); break
      case 'role':     aVal = (a.role     || '').toLowerCase(); bVal = (b.role     || '').toLowerCase(); break
      case 'username': aVal = (a.username || '').toLowerCase(); bVal = (b.username || '').toLowerCase(); break
      case 'status':   aVal = a.is_active ? 1 : 0;             bVal = b.is_active ? 1 : 0;             break
      default:         aVal = ''; bVal = ''
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(afterSort.length / PAGE_SIZE)
  const paginated  = afterSort.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown size={13} className="inline ml-1 text-gray-300 dark:text-gray-600" />
    return sortDir === 'asc'
      ? <ArrowUp size={13} className="inline ml-1 text-indigo-500" />
      : <ArrowDown size={13} className="inline ml-1 text-indigo-500" />
  }

  const FILTERS = ['all', 'principal', 'hod', 'teacher', 'student']

  return (
    <div>
      <PageHeader
        title="All Users"
        subtitle={`${users.length} total users in the system`}
        action={
          <Button onClick={() => navigate('/principal/add-user')} color="#4f46e5">
            <Plus size={15} /> Add User
          </Button>
        }
      />

      {/* ── Role filter pills ── */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map(role => {
          const meta   = ROLE_META[role]
          const active = filter === role
          return (
            <motion.button key={role} onClick={() => setFilter(role)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border-0 cursor-pointer transition-colors"
              style={active
                // Active pill: role accent colour — same in light and dark
                ? { backgroundColor: meta?.color || '#475569', color: '#fff' }
                // FIX: inactive pill used hardcoded '#f1f5f9' (light-only).
                // Now uses 'transparent' so the parent bg (white/dark) shows through,
                // and text colour handled by className below.
                : { backgroundColor: 'transparent' }}
              // Inactive text + border via Tailwind so dark: variant works
              data-inactive={active ? undefined : 'true'}
            >
              {/* Inner wrapper carries the visible inactive styling */}
              <span className={active
                ? ''
                : 'flex items-center gap-2 px-0 text-gray-600 dark:text-gray-400'}>
                {role === 'all' ? 'All' : meta.label}
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold"
                style={active
                  ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }
                  : { backgroundColor: 'transparent', color: '#94a3b8' }}>
                {counts[role]}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* ── Search + sort bar ── */}
      <div className="flex gap-3 mb-4 items-center">
        <div className="flex-1 max-w-sm">
          <AutoSearch
            placeholder="Search by name, email or username..."
            items={users}
            searchKeys={['first_name', 'email', 'username']}
            storageKey="principal_users_search"
            onSearch={val => setSearch(val)}
            onSelect={u => setSearch(u.first_name)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 dark:text-gray-500">Sort by</span>
          {/* FIX: added dark: classes to select and sort-direction button */}
          <select value={sortBy}
            onChange={e => { setSortBy(e.target.value); setSortDir('asc') }}
            className="text-sm border border-gray-200 dark:border-gray-700
              rounded-lg px-3 py-2 outline-none
              bg-white dark:bg-gray-800
              text-gray-700 dark:text-gray-200
              focus:ring-2 focus:ring-indigo-500">
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="username">Username</option>
            <option value="role">Role</option>
            <option value="status">Status</option>
          </select>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="text-sm border border-gray-200 dark:border-gray-700
              rounded-lg px-3 py-2
              bg-white dark:bg-gray-800
              text-gray-600 dark:text-gray-300
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-colors cursor-pointer">
            {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
          </motion.button>
        </div>
      </div>

      {loading ? <SkeletonTable rows={8} /> : (
        <>
          {/* ── Table card ── */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl
              border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                {/* FIX: thead row dark background */}
                <tr className="border-b border-gray-100 dark:border-gray-800
                  bg-gray-50 dark:bg-gray-800/60">
                  <th className="px-4 py-3 text-left text-xs font-medium
                    text-gray-400 dark:text-gray-500 w-10">#</th>
                  {[
                    { label: 'Name',     field: 'name'     },
                    { label: 'Email',    field: 'email'    },
                    { label: 'Username', field: 'username' },
                    { label: 'Phone',    field: null       },
                    { label: 'Role',     field: 'role'     },
                    { label: 'Status',   field: 'status'   },
                    { label: 'Actions',  field: null       },
                  ].map(({ label, field }) => (
                    <th key={label}
                      onClick={field ? () => toggleSort(field) : undefined}
                      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wide
                        text-gray-400 dark:text-gray-500
                        ${field ? 'cursor-pointer hover:text-gray-600 dark:hover:text-gray-300' : ''}`}>
                      {label} {field && <SortIcon field={field} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginated.map((u, idx) => {
                    const meta = ROLE_META[u.role] || { color: '#64748b', bg: '#f1f5f9', label: u.role }
                    return (
                      <motion.tr key={u.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        // FIX: removed whileHover={{ backgroundColor: 'var(--hover-row)' }}
                        // That set a white inline style in dark mode making rows flash
                        // white and hiding the name text (white-on-white).
                        // CSS hover classes are instant, theme-aware, and don't
                        // interfere with the entrance animation timing.
                        onClick={() => navigate(`/principal/user/${u.id}`)}
                        className="border-b border-gray-50 dark:border-gray-800
                          cursor-pointer transition-colors duration-150
                          hover:bg-slate-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center
                              text-white text-xs font-semibold shrink-0"
                              style={{ backgroundColor: meta.color }}>
                              {(u.first_name || '?').charAt(0).toUpperCase()}
                            </div>
                            {/* FIX: was text-gray-800 only — now includes dark:text-gray-100
                                so name is readable on the dark:hover:bg-gray-800 row bg */}
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              {u.first_name} {u.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700
                            text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded">
                            @{u.username}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {u.phone || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={meta.label} color={meta.color} bg={meta.bg} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium"
                            style={{ color: u.is_active ? '#16a34a' : '#dc2626' }}>
                            ● {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/principal/edit-user/${u.id}`)}
                              className="p-1.5 rounded-lg
                                bg-blue-50 dark:bg-blue-950
                                text-blue-600 dark:text-blue-400
                                hover:bg-blue-100 dark:hover:bg-blue-900
                                transition-colors">
                              <Pencil size={13} />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={e => handleDelete(e, u.id)}
                              className="p-1.5 rounded-lg
                                bg-red-50 dark:bg-red-950
                                text-red-500 dark:text-red-400
                                hover:bg-red-100 dark:hover:bg-red-900
                                transition-colors">
                              <Trash2 size={13} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {paginated.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                {search ? `No users matching "${search}"` : 'No users found.'}
              </div>
            )}
          </motion.div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, afterSort.length)} of {afterSort.length} users
              </span>
              <div className="flex gap-1 items-center">
                {[
                  { label: '«', action: () => setPage(1),        disabled: page === 1 },
                  { label: '‹', action: () => setPage(p => p-1), disabled: page === 1 },
                ].map(b => (
                  <motion.button key={b.label} onClick={b.action} disabled={b.disabled}
                    whileHover={!b.disabled ? { scale: 1.05 } : {}}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700
                      text-sm bg-white dark:bg-gray-800
                      text-gray-600 dark:text-gray-300
                      hover:bg-gray-50 dark:hover:bg-gray-700
                      disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {b.label}
                  </motion.button>
                ))}

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx-1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) => p === '...'
                    ? <span key={`d${idx}`} className="w-8 text-center text-gray-400 dark:text-gray-500 text-sm">…</span>
                    : (
                      <motion.button key={p} onClick={() => setPage(p)}
                        whileHover={{ scale: 1.05 }}
                        className="w-8 h-8 rounded-lg border text-sm font-medium transition-colors"
                        style={page === p
                          ? { backgroundColor: '#4f46e5', color: '#fff', borderColor: '#4f46e5' }
                          // FIX: inactive pagination buttons — dark bg + text via style fallback
                          : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#374151' }}>
                        {p}
                      </motion.button>
                    )
                  )}

                {[
                  { label: '›', action: () => setPage(p => p+1), disabled: page === totalPages },
                  { label: '»', action: () => setPage(totalPages), disabled: page === totalPages },
                ].map(b => (
                  <motion.button key={b.label} onClick={b.action} disabled={b.disabled}
                    whileHover={!b.disabled ? { scale: 1.05 } : {}}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700
                      text-sm bg-white dark:bg-gray-800
                      text-gray-600 dark:text-gray-300
                      hover:bg-gray-50 dark:hover:bg-gray-700
                      disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {b.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-3">
            Showing {paginated.length} of {afterSort.length} filtered
            {afterSort.length !== users.length && ` (${users.length} total)`}
          </p>
        </>
      )}
    </div>
  )
}