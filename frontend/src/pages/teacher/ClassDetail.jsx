// src/pages/teacher/ClassDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../api/axios'
import { downloadCSV, downloadExcel } from '../../utils/exportClass'

export default function ClassDetail() {
  const { id }                        = useParams()
  const navigate                      = useNavigate()
  const [cls,         setCls]         = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [grades,      setGrades]      = useState([])       // ← added
  const [search,      setSearch]      = useState('')
  const [addSearch,   setAddSearch]   = useState('')
  const [loading,     setLoading]     = useState(true)
  const [showAdd,     setShowAdd]     = useState(false)
  const [adding,      setAdding]      = useState(false)
  const [removing,    setRemoving]    = useState(null)
  const [success,     setSuccess]     = useState('')
  const [error,       setError]       = useState('')

  const loadData = () => {
    Promise.all([
      API.get(`/classes/${id}/`),
      API.get('/enrollments/'),
      API.get('/students/'),
      API.get('/grades/'),                               // ← added
    ]).then(([clsRes, enrRes, stuRes, grRes]) => {
      setCls(clsRes.data)
      setEnrollments(enrRes.data.filter(e => e.cls === parseInt(id)))
      setAllStudents(stuRes.data)
      setGrades(grRes.data)                             // ← added
    }).catch(() => setError('Could not load class details.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [id])

  const enrolledStudentIds = enrollments.map(e => e.student)

  const availableStudents = allStudents.filter(s =>
    !enrolledStudentIds.includes(s.user) &&
    s.full_name.toLowerCase().includes(addSearch.toLowerCase()) ||
    !enrolledStudentIds.includes(s.user) &&
    (s.roll_number || '').toLowerCase().includes(addSearch.toLowerCase())
  )

  const filteredEnrollments = enrollments.filter(e =>
    e.student_name.toLowerCase().includes(search.toLowerCase()) ||
    e.roll_number.toLowerCase().includes(search.toLowerCase())
  )

  const showMsg = (msg, isError = false) => {
    if (isError) setError(msg)
    else setSuccess(msg)
    setTimeout(() => { setSuccess(''); setError('') }, 3000)
  }

  const handleAdd = async (studentProfileId) => {
    setAdding(true)
    try {
      await API.post('/enrollments/', {
        student: studentProfileId,
        cls:     parseInt(id),
      })
      showMsg('Student added successfully!')
      setAddSearch('')
      loadData()
    } catch (err) {
      showMsg(
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to add student.',
        true
      )
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (enrollmentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this class?`)) return
    setRemoving(enrollmentId)
    try {
      await API.delete(`/enrollments/${enrollmentId}/`)
      showMsg('Student removed successfully!')
      loadData()
    } catch (err) {
      showMsg('Failed to remove student.', true)
    } finally {
      setRemoving(null)
    }
  }

  // ── Export helpers ──────────────────────────────────────────────
  const subjectName = cls?.subject_name?.split(' - ')[1] || cls?.subject_name || 'Subject'
  const semester    = cls?.semester || '?'

  const handleDownloadCSV = () => {
    downloadCSV(enrollments, grades, subjectName, semester)
  }

  const handleDownloadExcel = () => {
    downloadExcel(enrollments, grades, subjectName, semester)
  }

  if (loading) return <p style={{padding:'32px', color:'#64748b'}}>Loading...</p>
  if (!cls)    return <p style={{padding:'32px', color:'#dc2626'}}>Class not found.</p>

  return (
    <div>
      <div style={styles.topRow}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
      </div>

      <div style={styles.classHeader}>
        <div>
          <div style={styles.classCode}>
            {cls.subject_name?.split(' - ')[0]}
          </div>
          <h2 style={styles.className}>
            {cls.subject_name?.split(' - ')[1] || cls.subject_name}
          </h2>
          <div style={styles.classMeta}>
            {cls.academic_year} · Teacher: {cls.teacher_name} · Semester {semester}
          </div>
        </div>
        <div style={styles.enrollCount}>
          <span style={styles.enrollNumber}>{enrollments.length}</span>
          <span style={styles.enrollLabel}>Students enrolled</span>
        </div>
      </div>

      {success && <div style={styles.successMsg}>{success}</div>}
      {error   && <div style={styles.errorMsg}>{error}</div>}

      <div style={styles.card}>
        <div style={styles.cardTopRow}>
          <h3 style={styles.cardTitle}>Enrolled Students</h3>

          {/* Action buttons row */}
          <div style={styles.btnGroup}>
            {/* Download buttons — only show if students exist */}
            {enrollments.length > 0 && (
              <>
                <button onClick={handleDownloadCSV} style={styles.csvBtn}>
                  ↓ CSV
                </button>
                <button onClick={handleDownloadExcel} style={styles.excelBtn}>
                  ↓ Excel
                </button>
              </>
            )}
            <button
              onClick={() => { setShowAdd(!showAdd); setAddSearch('') }}
              style={styles.addBtn}
            >
              {showAdd ? '✕ Cancel' : '+ Add Student'}
            </button>
          </div>
        </div>

        {showAdd && (
          <div style={styles.addPanel}>
            <input
              placeholder="Search student by name or roll number to add..."
              value={addSearch}
              onChange={e => setAddSearch(e.target.value)}
              style={styles.searchInput}
              autoFocus
            />
            {addSearch && (
              <div style={styles.addList}>
                {availableStudents.length === 0 ? (
                  <div style={styles.addListEmpty}>
                    No available students found. They may already be enrolled.
                  </div>
                ) : (
                  availableStudents.slice(0, 8).map(s => (
                    <div key={s.id} style={styles.addListItem}>
                      <div>
                        <div style={styles.addStudentName}>{s.full_name}</div>
                        <div style={styles.addStudentMeta}>
                          {s.roll_number} · Sem {s.semester}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAdd(s.id)}
                        disabled={adding}
                        style={styles.addListBtn}
                      >
                        {adding ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div style={styles.searchRow}>
          <input
            placeholder="Search enrolled students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <span style={styles.resultCount}>
            {filteredEnrollments.length} of {enrollments.length} students
          </span>
        </div>

        {filteredEnrollments.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Roll Number</th>
                <th style={styles.th}>Enrolled On</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((en, idx) => (
                <tr key={en.id} style={styles.tr}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    <div style={styles.studentAvatar}>
                      <div style={styles.avatarDot}>
                        {en.student_name.charAt(0)}
                      </div>
                      <span>{en.student_name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.rollBadge}>{en.roll_number}</span>
                  </td>
                  <td style={styles.td}>
                    {new Date(en.enrolled_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleRemove(en.id, en.student_name)}
                      disabled={removing === en.id}
                      style={styles.removeBtn}
                    >
                      {removing === en.id ? 'Removing...' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>
            {search
              ? `No students found matching "${search}"`
              : 'No students enrolled yet. Click "+ Add Student" to enroll students.'
            }
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  topRow:         { marginBottom: '16px' },
  backBtn:        { background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px',
                    padding: '6px 14px', cursor: 'pointer', color: '#64748b', fontSize: '14px' },
  classHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    backgroundColor: '#fff', padding: '24px', borderRadius: '10px',
                    border: '1px solid #e2e8f0', marginBottom: '20px' },
  classCode:      { fontSize: '13px', color: '#0d9488', fontWeight: '600', marginBottom: '4px' },
  className:      { fontSize: '22px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px 0' },
  classMeta:      { fontSize: '14px', color: '#64748b' },
  enrollCount:    { display: 'flex', flexDirection: 'column', alignItems: 'center',
                    backgroundColor: '#f0fdfa', padding: '16px 24px', borderRadius: '10px' },
  enrollNumber:   { fontSize: '36px', fontWeight: '700', color: '#0d9488' },
  enrollLabel:    { fontSize: '12px', color: '#0d9488', fontWeight: '500' },
  successMsg:     { backgroundColor: '#dcfce7', color: '#16a34a', padding: '10px 16px',
                    borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  errorMsg:       { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 16px',
                    borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  card:           { backgroundColor: '#fff', borderRadius: '10px',
                    border: '1px solid #e2e8f0', overflow: 'hidden' },
  cardTopRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  cardTitle:      { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 },
  btnGroup:       { display: 'flex', gap: '8px', alignItems: 'center' },   // ← added
  csvBtn:         { padding: '7px 14px', backgroundColor: '#f0fdf4', color: '#16a34a',
                    border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '500' },                  // ← added
  excelBtn:       { padding: '7px 14px', backgroundColor: '#eff6ff', color: '#2563eb',
                    border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '500' },                  // ← added
  addBtn:         { padding: '8px 16px', backgroundColor: '#0d9488', color: '#fff',
                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '500' },
  addPanel:       { padding: '16px 20px', backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #f1f5f9' },
  addList:        { marginTop: '8px', border: '1px solid #e2e8f0', borderRadius: '8px',
                    backgroundColor: '#fff', maxHeight: '260px', overflowY: 'auto' },
  addListEmpty:   { padding: '16px', color: '#94a3b8', fontSize: '14px', textAlign: 'center' },
  addListItem:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', borderBottom: '1px solid #f8fafc' },
  addStudentName: { fontSize: '14px', fontWeight: '500', color: '#0f172a' },
  addStudentMeta: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
  addListBtn:     { padding: '5px 14px', backgroundColor: '#0d9488', color: '#fff',
                    border: 'none', borderRadius: '5px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '500' },
  searchRow:      { display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 20px', borderBottom: '1px solid #f1f5f9' },
  searchInput:    { flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0',
                    borderRadius: '6px', fontSize: '14px', outline: 'none' },
  resultCount:    { fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' },
  table:          { width: '100%', borderCollapse: 'collapse' },
  th:             { textAlign: 'left', padding: '12px 20px', fontSize: '13px',
                    color: '#64748b', backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #f1f5f9' },
  tr:             { transition: 'background 0.1s' },
  td:             { padding: '12px 20px', fontSize: '14px', color: '#374151',
                    borderBottom: '1px solid #f8fafc' },
  studentAvatar:  { display: 'flex', alignItems: 'center', gap: '10px' },
  avatarDot:      { width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: '#f0fdfa', color: '#0d9488', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: '600', fontSize: '14px', flexShrink: 0 },
  rollBadge:      { backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px',
                    borderRadius: '4px', fontSize: '13px', fontWeight: '500' },
  removeBtn:      { padding: '5px 12px', backgroundColor: '#fef2f2', color: '#dc2626',
                    border: '1px solid #fecaca', borderRadius: '5px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '500' },
  emptyState:     { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
}
