// src/pages/principal/SubjectDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function SubjectDetail() {
  const { id }                        = useParams()
  const navigate                      = useNavigate()
  const [subject,     setSubject]     = useState(null)
  const [classInfo,   setClassInfo]   = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [search,      setSearch]      = useState('')

  useEffect(() => {
    Promise.all([
      API.get(`/subjects/${id}/`),
      API.get('/classes/'),
      API.get('/enrollments/'),
    ]).then(([subjRes, clsRes, enrRes]) => {
      const subj = subjRes.data
      setSubject(subj)

      // Find the class for this subject
      const cls = clsRes.data.find(c => c.subject === parseInt(id))
      setClassInfo(cls || null)

      // Find enrollments for this class
      if (cls) {
        const classEnrollments = enrRes.data.filter(e => e.cls === cls.id)
        setEnrollments(classEnrollments)
      }
    }).catch(() => setError('Could not load subject details.'))
      .finally(() => setLoading(false))
  }, [id])

  const filtered = enrollments.filter(e =>
    e.student_name.toLowerCase().includes(search.toLowerCase()) ||
    e.roll_number.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p style={{padding:'32px', color:'#64748b'}}>Loading...</p>
  if (error)   return <p style={{padding:'32px', color:'#dc2626'}}>{error}</p>
  if (!subject) return <p style={{padding:'32px', color:'#dc2626'}}>Subject not found.</p>

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back to Departments
      </button>

      {/* Subject header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.subjectCode}>{subject.code}</div>
          <h2 style={styles.subjectName}>{subject.name}</h2>
          <div style={styles.metaRow}>
            <span style={styles.metaChip}>
              Semester {subject.semester}
            </span>
            <span style={styles.metaChip}>
              {subject.credits} Credits
            </span>
            <span style={styles.metaChip}>
              {subject.department_name}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <div style={styles.statNum}>{enrollments.length}</div>
            <div style={styles.statLabel}>Students</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNum}>
              {classInfo?.is_active ? '✓' : '✗'}
            </div>
            <div style={styles.statLabel}>
              {classInfo?.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher info card */}
      <div style={styles.teacherCard}>
        <div style={styles.sectionTitle}>Teacher</div>
        {classInfo ? (
          <div style={styles.teacherRow}>
            <div style={styles.teacherAvatar}>
              {classInfo.teacher_name?.charAt(0)}
            </div>
            <div>
              <div style={styles.teacherName}>{classInfo.teacher_name}</div>
              <div style={styles.teacherMeta}>
                Academic Year: {classInfo.academic_year}
              </div>
            </div>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: classInfo.is_active ? '#dcfce7' : '#f1f5f9',
              color: classInfo.is_active ? '#16a34a' : '#64748b',
            }}>
              {classInfo.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ) : (
          <p style={{color:'#94a3b8', fontSize:'14px'}}>
            No teacher assigned to this subject yet.
          </p>
        )}
      </div>

      {/* Students table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.sectionTitle}>Enrolled Students</div>
            <div style={styles.cardSub}>
              {enrollments.length} students in Semester {subject.semester}
            </div>
          </div>
          <input
            placeholder="Search by name or roll no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {filtered.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Student Name</th>
                <th style={styles.th}>Roll Number</th>
                <th style={styles.th}>Enrolled On</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((en, idx) => (
                <tr key={en.id}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    <div style={styles.studentRow}>
                      <div style={styles.avatar}>
                        {en.student_name.charAt(0)}
                      </div>
                      {en.student_name}
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
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>
            {search
              ? `No students matching "${search}"`
              : 'No students enrolled in this subject yet.'
            }
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  backBtn:      { background:'none', border:'1px solid #e2e8f0', borderRadius:'6px',
                  padding:'6px 14px', cursor:'pointer', color:'#64748b',
                  fontSize:'14px', marginBottom:'20px' },
  header:       { display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                  backgroundColor:'#fff', padding:'24px', borderRadius:'12px',
                  border:'1px solid #e2e8f0', marginBottom:'16px' },
  headerLeft:   { flex: 1 },
  subjectCode:  { fontSize:'13px', color:'#7c3aed', fontWeight:'700',
                  marginBottom:'4px', letterSpacing:'0.05em' },
  subjectName:  { fontSize:'24px', fontWeight:'700', color:'#0f172a',
                  margin:'0 0 12px 0' },
  metaRow:      { display:'flex', gap:'8px', flexWrap:'wrap' },
  metaChip:     { backgroundColor:'#f5f3ff', color:'#7c3aed', padding:'4px 12px',
                  borderRadius:'20px', fontSize:'13px', fontWeight:'500' },
  statsRow:     { display:'flex', gap:'16px' },
  statBox:      { backgroundColor:'#f5f3ff', padding:'16px 24px', borderRadius:'10px',
                  textAlign:'center', minWidth:'80px' },
  statNum:      { fontSize:'28px', fontWeight:'700', color:'#7c3aed' },
  statLabel:    { fontSize:'12px', color:'#7c3aed', fontWeight:'500', marginTop:'2px' },
  teacherCard:  { backgroundColor:'#fff', padding:'20px', borderRadius:'12px',
                  border:'1px solid #e2e8f0', marginBottom:'16px' },
  sectionTitle: { fontSize:'13px', fontWeight:'600', color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'12px' },
  teacherRow:   { display:'flex', alignItems:'center', gap:'14px' },
  teacherAvatar:{ width:'44px', height:'44px', borderRadius:'50%',
                  backgroundColor:'#7c3aed', color:'#fff', display:'flex',
                  alignItems:'center', justifyContent:'center',
                  fontSize:'18px', fontWeight:'600', flexShrink:0 },
  teacherName:  { fontSize:'16px', fontWeight:'600', color:'#0f172a' },
  teacherMeta:  { fontSize:'13px', color:'#64748b', marginTop:'2px' },
  statusBadge:  { marginLeft:'auto', padding:'5px 12px', borderRadius:'20px',
                  fontSize:'13px', fontWeight:'500' },
  card:         { backgroundColor:'#fff', borderRadius:'12px',
                  border:'1px solid #e2e8f0', overflow:'hidden' },
  cardHeader:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                  padding:'20px', borderBottom:'1px solid #f1f5f9' },
  cardSub:      { fontSize:'13px', color:'#64748b', marginTop:'2px' },
  searchInput:  { padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:'6px',
                  fontSize:'14px', width:'240px', outline:'none' },
  table:        { width:'100%', borderCollapse:'collapse' },
  th:           { textAlign:'left', padding:'12px 20px', fontSize:'13px',
                  color:'#64748b', backgroundColor:'#f8fafc',
                  borderBottom:'1px solid #f1f5f9' },
  td:           { padding:'12px 20px', fontSize:'14px', color:'#374151',
                  borderBottom:'1px solid #f8fafc' },
  studentRow:   { display:'flex', alignItems:'center', gap:'10px' },
  avatar:       { width:'32px', height:'32px', borderRadius:'50%',
                  backgroundColor:'#f5f3ff', color:'#7c3aed', display:'flex',
                  alignItems:'center', justifyContent:'center',
                  fontWeight:'600', fontSize:'13px', flexShrink:0 },
  rollBadge:    { backgroundColor:'#f1f5f9', color:'#475569', padding:'3px 8px',
                  borderRadius:'4px', fontSize:'13px', fontWeight:'500' },
  emptyState:   { padding:'40px', textAlign:'center', color:'#94a3b8', fontSize:'14px' },
}