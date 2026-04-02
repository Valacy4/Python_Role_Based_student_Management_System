// src/pages/principal/DeleteBatch.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function DeleteBatch() {
  const navigate                        = useNavigate()
  const [departments,  setDepartments]  = useState([])
  const [students,     setStudents]     = useState([])
  const [deptFilter,   setDeptFilter]   = useState('')
  const [batchFilter,  setBatchFilter]  = useState('')
  const [semFilter,    setSemFilter]    = useState('')
  const [selected,     setSelected]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [deleting,     setDeleting]     = useState(false)
  const [success,      setSuccess]      = useState('')
  const [error,        setError]        = useState('')

  useEffect(() => {
    Promise.all([
      API.get('/departments/'),
      API.get('/students/'),
    ]).then(([deptRes, stuRes]) => {
      setDepartments(deptRes.data)
      setStudents(stuRes.data)
    }).finally(() => setLoading(false))
  }, [])

  // Get unique batch years
  const batchYears = [...new Set(students.map(s => s.batch_year))].sort((a, b) => b - a)

  // Filter students
  const filtered = students.filter(s => {
    const matchDept  = !deptFilter  || s.department === parseInt(deptFilter)
    const matchBatch = !batchFilter || s.batch_year  === parseInt(batchFilter)
    const matchSem   = !semFilter   || s.semester    === parseInt(semFilter)
    return matchDept && matchBatch && matchSem
  })

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([])
    } else {
      setSelected(filtered.map(s => s.user))
    }
  }

  const handleDelete = async () => {
    if (selected.length === 0) {
      setError('No students selected.')
      return
    }
    if (!window.confirm(
      `Are you sure you want to permanently delete ${selected.length} student(s)?\n\nThis will also delete their enrollments, attendance and grades.`
    )) return

    setDeleting(true)
    setError('')
    let successCount = 0
    let failCount    = 0

    for (const userId of selected) {
      try {
        await API.delete(`/auth/users/${userId}/`)
        successCount++
      } catch {
        failCount++
      }
    }

    // Refresh student list
    const res = await API.get('/students/')
    setStudents(res.data)
    setSelected([])
    setDeleting(false)

    if (failCount === 0) {
      setSuccess(`Successfully deleted ${successCount} student(s).`)
      setTimeout(() => setSuccess(''), 4000)
    } else {
      setError(`Deleted ${successCount}, failed ${failCount}.`)
    }
  }

  if (loading) return <p style={{padding:'32px', color:'#64748b'}}>Loading...</p>

  return (
    <div>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>

      <h2 style={styles.heading}>Delete Batch Students</h2>
      <p style={styles.sub}>
        Filter students by department, batch year or semester, select them, then delete.
      </p>

      {success && <div style={styles.successMsg}>{success}</div>}
      {error   && <div style={styles.errorMsg}>{error}</div>}

      {/* Warning banner */}
      <div style={styles.warningBanner}>
        ⚠ This permanently deletes selected students and all their data
        (enrollments, attendance, grades). This cannot be undone.
      </div>

      {/* Filters */}
      <div style={styles.filterCard}>
        <div style={styles.filterTitle}>Filter Students</div>
        <div style={styles.filterRow}>
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>Department</label>
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setSelected([]) }}
              style={styles.select}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>Batch Year</label>
            <select
              value={batchFilter}
              onChange={e => { setBatchFilter(e.target.value); setSelected([]) }}
              style={styles.select}
            >
              <option value="">All Batches</option>
              {batchYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>Semester</label>
            <select
              value={semFilter}
              onChange={e => { setSemFilter(e.target.value); setSelected([]) }}
              style={styles.select}
            >
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { setDeptFilter(''); setBatchFilter(''); setSemFilter(''); setSelected([]) }}
            style={styles.clearBtn}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Student table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>
            {filtered.length} students found
            {selected.length > 0 && (
              <span style={styles.selectedCount}> · {selected.length} selected</span>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={selected.length === 0 || deleting}
            style={{
              ...styles.deleteBtn,
              opacity: selected.length === 0 || deleting ? 0.5 : 1,
              cursor:  selected.length === 0 || deleting ? 'not-allowed' : 'pointer',
            }}
          >
            {deleting ? 'Deleting...' : `🗑 Delete Selected (${selected.length})`}
          </button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.length === filtered.length}
                  onChange={toggleAll}
                  style={{cursor:'pointer'}}
                />
              </th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Roll Number</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Semester</th>
              <th style={styles.th}>Batch Year</th>
              <th style={styles.th}>Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr
                key={s.id}
                style={{
                  ...styles.tr,
                  backgroundColor: selected.includes(s.user) ? '#fef2f2' : 'transparent'
                }}
                onClick={() => toggleSelect(s.user)}
              >
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={selected.includes(s.user)}
                    onChange={() => toggleSelect(s.user)}
                    onClick={e => e.stopPropagation()}
                    style={{cursor:'pointer'}}
                  />
                </td>
                <td style={styles.td}>{s.full_name}</td>
                <td style={styles.td}>
                  <span style={styles.rollBadge}>{s.roll_number}</span>
                </td>
                <td style={styles.td}>{s.department_name}</td>
                <td style={styles.td}>Sem {s.semester}</td>
                <td style={styles.td}>{s.batch_year}</td>
                <td style={styles.td}>{s.email}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p style={{color:'#94a3b8', padding:'20px', textAlign:'center'}}>
            No students match the selected filters.
          </p>
        )}
      </div>
    </div>
  )
}

const styles = {
  backBtn:       { background:'none', border:'1px solid #e2e8f0', borderRadius:'6px',
                   padding:'6px 14px', cursor:'pointer', color:'#64748b',
                   fontSize:'14px', marginBottom:'20px' },
  heading:       { fontSize:'22px', fontWeight:'600', color:'#0f172a', marginBottom:'4px' },
  sub:           { color:'#64748b', fontSize:'14px', marginBottom:'20px' },
  successMsg:    { backgroundColor:'#dcfce7', color:'#16a34a', padding:'10px 16px',
                   borderRadius:'8px', marginBottom:'16px', fontSize:'14px' },
  errorMsg:      { backgroundColor:'#fef2f2', color:'#dc2626', padding:'10px 16px',
                   borderRadius:'8px', marginBottom:'16px', fontSize:'14px' },
  warningBanner: { backgroundColor:'#fffbeb', border:'1px solid #fde68a', borderRadius:'8px',
                   padding:'12px 16px', marginBottom:'20px', fontSize:'14px', color:'#92400e' },
  filterCard:    { backgroundColor:'#fff', padding:'20px', borderRadius:'10px',
                   border:'1px solid #e2e8f0', marginBottom:'16px' },
  filterTitle:   { fontSize:'13px', fontWeight:'600', color:'#94a3b8', textTransform:'uppercase',
                   letterSpacing:'0.05em', marginBottom:'14px' },
  filterRow:     { display:'flex', gap:'16px', alignItems:'flex-end', flexWrap:'wrap' },
  filterField:   { display:'flex', flexDirection:'column', gap:'6px' },
  filterLabel:   { fontSize:'13px', fontWeight:'500', color:'#374151' },
  select:        { padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:'6px',
                   fontSize:'14px', outline:'none', minWidth:'160px' },
  clearBtn:      { padding:'8px 14px', backgroundColor:'#f1f5f9', color:'#374151',
                   border:'1px solid #e2e8f0', borderRadius:'6px', cursor:'pointer',
                   fontSize:'13px', alignSelf:'flex-end' },
  card:          { backgroundColor:'#fff', borderRadius:'10px',
                   border:'1px solid #e2e8f0', overflow:'hidden' },
  cardHeader:    { display:'flex', justifyContent:'space-between', alignItems:'center',
                   padding:'16px 20px', borderBottom:'1px solid #f1f5f9' },
  cardTitle:     { fontSize:'15px', fontWeight:'600', color:'#0f172a' },
  selectedCount: { color:'#dc2626', fontWeight:'600' },
  deleteBtn:     { padding:'8px 18px', backgroundColor:'#dc2626', color:'#fff',
                   border:'none', borderRadius:'6px', fontSize:'14px', fontWeight:'500' },
  table:         { width:'100%', borderCollapse:'collapse' },
  th:            { textAlign:'left', padding:'12px 16px', fontSize:'13px', color:'#64748b',
                   backgroundColor:'#f8fafc', borderBottom:'1px solid #f1f5f9' },
  tr:            { cursor:'pointer', transition:'background 0.1s' },
  td:            { padding:'12px 16px', fontSize:'14px', color:'#374151',
                   borderBottom:'1px solid #f8fafc' },
  rollBadge:     { backgroundColor:'#f1f5f9', color:'#475569', padding:'3px 8px',
                   borderRadius:'4px', fontSize:'13px', fontWeight:'500' },
}