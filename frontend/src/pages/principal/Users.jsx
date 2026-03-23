// src/pages/principal/Users.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../../api/axios'

const PAGE_SIZE = 20

export default function PrincipalUsers() {
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')
  const [sortBy,     setSortBy]     = useState('name')
  const [sortDir,    setSortDir]    = useState('asc')
  const [page,       setPage]       = useState(1)
  const [successMsg, setSuccessMsg] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    API.get('/auth/users/')
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMsg(location.state.success)
      window.history.replaceState({}, '')
      const t = setTimeout(() => setSuccessMsg(''), 4000)
      return () => clearTimeout(t)
    }
  }, [location.state])

  // Reset to page 1 when search/filter/sort changes
  useEffect(() => { setPage(1) }, [search, filter, sortBy, sortDir])

  const handleDelete = async (e, id) => {
    e.stopPropagation()  // prevent row click when deleting
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await API.delete(`/auth/users/${id}/`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      alert('Failed to delete user.')
    }
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const roleColors = {
    principal: '#7c3aed', hod: '#d97706',
    teacher:   '#0d9488', student: '#2563eb',
  }

  const counts = {
    all:       users.length,
    principal: users.filter(u => u.role === 'principal').length,
    hod:       users.filter(u => u.role === 'hod').length,
    teacher:   users.filter(u => u.role === 'teacher').length,
    student:   users.filter(u => u.role === 'student').length,
  }

  // Filter
  const afterFilter = users.filter(u => {
    const matchSearch =
      (u.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.last_name  || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email      || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.username   || '').toLowerCase().includes(search.toLowerCase())
    const matchRole = filter === 'all' || u.role === filter
    return matchSearch && matchRole
  })

  // Sort
  const afterSort = [...afterFilter].sort((a, b) => {
    let aVal, bVal
    switch (sortBy) {
      case 'name':
        aVal = `${a.first_name} ${a.last_name}`.toLowerCase()
        bVal = `${b.first_name} ${b.last_name}`.toLowerCase()
        break
      case 'email':
        aVal = (a.email || '').toLowerCase()
        bVal = (b.email || '').toLowerCase()
        break
      case 'role':
        aVal = a.role || ''
        bVal = b.role || ''
        break
      case 'username':
        aVal = (a.username || '').toLowerCase()
        bVal = (b.username || '').toLowerCase()
        break
      case 'status':
        aVal = a.is_active ? 1 : 0
        bVal = b.is_active ? 1 : 0
        break
      default:
        aVal = ''
        bVal = ''
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  // Paginate
  const totalPages  = Math.ceil(afterSort.length / PAGE_SIZE)
  const paginated   = afterSort.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span style={styles.sortIconInactive}>↕</span>
    return <span style={styles.sortIconActive}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.topRow}>
        <div>
          <h2 style={styles.heading}>All Users</h2>
          <p style={styles.sub}>{users.length} total users in the system</p>
        </div>
        <button onClick={() => navigate('/principal/add-user')} style={styles.addBtn}>
          + Add User
        </button>
      </div>

      {successMsg && <div style={styles.successMsg}>{successMsg}</div>}

      {/* Role filter pills */}
      <div style={styles.summaryRow}>
        {['all', 'principal', 'hod', 'teacher', 'student'].map(role => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            style={{
              ...styles.summaryPill,
              backgroundColor: filter === role ? (roleColors[role] || '#475569') : '#f1f5f9',
              color: filter === role ? '#fff' : '#64748b',
            }}
          >
            {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
            <span style={{
              ...styles.pillCount,
              backgroundColor: filter === role ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
              color: filter === role ? '#fff' : '#64748b',
            }}>
              {counts[role]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Sort row */}
      <div style={styles.filterRow}>
        <input
          placeholder="Search by name, email or username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />
        <div style={styles.sortGroup}>
          <span style={styles.sortLabel}>Sort by</span>
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setSortDir('asc') }}
            style={styles.select}
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="username">Username</option>
            <option value="role">Role</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            style={styles.sortDirBtn}
            title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {loading ? <p style={{color:'#64748b'}}>Loading...</p> : (
        <>
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={{...styles.th, cursor:'pointer'}} onClick={() => toggleSort('name')}>
                    Name <SortIcon field="name" />
                  </th>
                  <th style={{...styles.th, cursor:'pointer'}} onClick={() => toggleSort('email')}>
                    Email <SortIcon field="email" />
                  </th>
                  <th style={{...styles.th, cursor:'pointer'}} onClick={() => toggleSort('username')}>
                    Username <SortIcon field="username" />
                  </th>
                  <th style={styles.th}>Phone</th>
                  <th style={{...styles.th, cursor:'pointer'}} onClick={() => toggleSort('role')}>
                    Role <SortIcon field="role" />
                  </th>
                  <th style={{...styles.th, cursor:'pointer'}} onClick={() => toggleSort('status')}>
                    Status <SortIcon field="status" />
                  </th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u, idx) => (
                  <tr
                    key={u.id}
                    style={styles.tr}
                    onClick={() => navigate(`/principal/edit-user/${u.id}`)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td style={styles.td}>
                      <div style={styles.nameRow}>
                        <div style={{...styles.avatar, backgroundColor: roleColors[u.role] || '#64748b'}}>
                          {(u.first_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={styles.fullName}>{u.first_name} {u.last_name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={styles.usernameBadge}>@{u.username}</span>
                    </td>
                    <td style={styles.td}>{u.phone || '—'}</td>
                    <td style={styles.td}>
                      <span style={{...styles.roleBadge, backgroundColor: roleColors[u.role] || '#64748b'}}>
                        {u.role || '—'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        color:      u.is_active ? '#16a34a' : '#dc2626',
                        fontWeight: '500', fontSize: '13px',
                      }}>
                        {u.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/principal/edit-user/${u.id}`) }}
                          style={styles.editBtn}
                        >
                          Edit
                        </button>
                        <button
                          onClick={e => handleDelete(e, u.id)}
                          style={styles.deleteBtn}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginated.length === 0 && (
              <p style={{color:'#64748b', padding:'20px', textAlign:'center'}}>
                {search ? `No users matching "${search}"` : 'No users found.'}
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <span style={styles.pageInfo}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, afterSort.length)} of {afterSort.length} users
              </span>
              <div style={styles.pageButtons}>
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  style={{...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {})}}
                >
                  «
                </button>
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  style={{...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {})}}
                >
                  ← Previous
                </button>

                {/* Page number buttons */}
                {Array.from({length: totalPages}, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} style={styles.pageDots}>...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          ...styles.pageBtn,
                          ...(page === p ? styles.pageBtnActive : {})
                        }}
                      >
                        {p}
                      </button>
                    )
                  )
                }

                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  style={{...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {})}}
                >
                  Next →
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  style={{...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {})}}
                >
                  »
                </button>
              </div>
            </div>
          )}

          <p style={styles.resultCount}>
            Showing {paginated.length} of {afterSort.length} filtered users
            {afterSort.length !== users.length && ` (${users.length} total)`}
          </p>
        </>
      )}
    </div>
  )
}

const styles = {
  topRow:          { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' },
  heading:         { fontSize:'22px', fontWeight:'600', color:'#0f172a', margin:0 },
  sub:             { color:'#64748b', fontSize:'14px', marginTop:'4px', marginBottom:0 },
  addBtn:          { padding:'9px 20px', backgroundColor:'#4f46e5', color:'#fff', border:'none',
                     borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'500', whiteSpace:'nowrap' },
  successMsg:      { backgroundColor:'#dcfce7', color:'#16a34a', padding:'10px 16px', borderRadius:'8px',
                     marginBottom:'16px', fontSize:'14px', border:'1px solid #bbf7d0', marginTop:'16px' },
  summaryRow:      { display:'flex', gap:'8px', margin:'20px 0 16px', flexWrap:'wrap' },
  summaryPill:     { display:'flex', alignItems:'center', gap:'8px', padding:'6px 14px',
                     borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'13px',
                     fontWeight:'500', transition:'all 0.15s' },
  pillCount:       { padding:'2px 7px', borderRadius:'10px', fontSize:'12px', fontWeight:'600' },
  filterRow:       { display:'flex', gap:'12px', marginBottom:'16px', alignItems:'center' },
  search:          { padding:'8px 14px', border:'1px solid #e2e8f0', borderRadius:'6px',
                     fontSize:'14px', flex:1, outline:'none' },
  sortGroup:       { display:'flex', alignItems:'center', gap:'8px' },
  sortLabel:       { fontSize:'13px', color:'#64748b', whiteSpace:'nowrap' },
  select:          { padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:'6px',
                     fontSize:'13px', outline:'none' },
  sortDirBtn:      { padding:'7px 12px', border:'1px solid #e2e8f0', borderRadius:'6px',
                     backgroundColor:'#f8fafc', cursor:'pointer', fontSize:'13px',
                     color:'#374151', whiteSpace:'nowrap' },
  card:            { backgroundColor:'#fff', borderRadius:'10px', border:'1px solid #e2e8f0', overflow:'hidden' },
  table:           { width:'100%', borderCollapse:'collapse' },
  th:              { textAlign:'left', padding:'12px 16px', fontSize:'13px', color:'#64748b',
                     borderBottom:'1px solid #f1f5f9', backgroundColor:'#f8fafc',
                     userSelect:'none' },
  tr:              { cursor:'pointer', transition:'background 0.1s' },
  td:              { padding:'12px 16px', fontSize:'14px', color:'#374151', borderBottom:'1px solid #f8fafc' },
  nameRow:         { display:'flex', alignItems:'center', gap:'10px' },
  avatar:          { width:'32px', height:'32px', borderRadius:'50%', display:'flex',
                     alignItems:'center', justifyContent:'center', color:'#fff',
                     fontWeight:'600', fontSize:'13px', flexShrink:0 },
  fullName:        { fontWeight:'500', color:'#0f172a', fontSize:'14px' },
  usernameBadge:   { fontSize:'12px', color:'#64748b', backgroundColor:'#f1f5f9',
                     padding:'2px 7px', borderRadius:'4px' },
  roleBadge:       { color:'#fff', padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
  actionRow:       { display:'flex', gap:'6px' },
  editBtn:         { padding:'4px 10px', backgroundColor:'#eff6ff', color:'#2563eb',
                     border:'1px solid #bfdbfe', borderRadius:'4px', cursor:'pointer',
                     fontSize:'12px', fontWeight:'500' },
  deleteBtn:       { padding:'4px 10px', backgroundColor:'#fee2e2', color:'#dc2626',
                     border:'1px solid #fecaca', borderRadius:'4px', cursor:'pointer',
                     fontSize:'12px', fontWeight:'500' },
  pagination:      { display:'flex', justifyContent:'space-between', alignItems:'center',
                     marginTop:'16px', flexWrap:'wrap', gap:'12px' },
  pageInfo:        { fontSize:'13px', color:'#64748b' },
  pageButtons:     { display:'flex', gap:'4px', alignItems:'center' },
  pageBtn:         { padding:'6px 12px', border:'1px solid #e2e8f0', borderRadius:'6px',
                     backgroundColor:'#fff', cursor:'pointer', fontSize:'13px', color:'#374151' },
  pageBtnActive:   { backgroundColor:'#4f46e5', color:'#fff', borderColor:'#4f46e5', fontWeight:'600' },
  pageBtnDisabled: { opacity:0.4, cursor:'not-allowed' },
  pageDots:        { padding:'6px 4px', fontSize:'13px', color:'#94a3b8' },
  sortIconActive:  { color:'#4f46e5', fontWeight:'700', marginLeft:'4px' },
  sortIconInactive:{ color:'#cbd5e1', marginLeft:'4px' },
  resultCount:     { color:'#94a3b8', fontSize:'13px', marginTop:'12px', textAlign:'right' },
}