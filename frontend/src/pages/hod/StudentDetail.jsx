// src/pages/hod/StudentDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function StudentDetail() {
  const { id }                        = useParams()  // student profile id
  const navigate                      = useNavigate()
  const [student,     setStudent]     = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [attendance,  setAttendance]  = useState([])
  const [grades,      setGrades]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [activeTab,   setActiveTab]   = useState('profile')

  useEffect(() => {
    Promise.all([
      API.get(`/students/${id}/`),
      API.get('/enrollments/'),
      API.get('/attendance/'),
      API.get('/grades/'),
    ]).then(([stuRes, enrRes, attRes, grRes]) => {
      const sp = stuRes.data
      setStudent(sp)

      const enr    = enrRes.data.filter(e => e.student === sp.id)
      const enrIds = enr.map(e => e.id)

      setEnrollments(enr)
      setAttendance(attRes.data.filter(a => enrIds.includes(a.enrollment)))
      setGrades(grRes.data.filter(g => enrIds.includes(g.enrollment)))
    }).catch(() => setError('Could not load student details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p style={{padding:'32px', color:'#64748b'}}>Loading...</p>
  if (error)   return <p style={{padding:'32px', color:'#dc2626'}}>{error}</p>
  if (!student) return <p style={{padding:'32px', color:'#dc2626'}}>Student not found.</p>

  // Group attendance by subject
  const attBySubject = attendance.reduce((acc, a) => {
    const subj = a.subject_name
    if (!acc[subj]) acc[subj] = { present:0, absent:0, total:0 }
    if (a.status === 'present') acc[subj].present++
    else acc[subj].absent++
    acc[subj].total++
    return acc
  }, {})

  // Group grades by subject
  const gradeBySubject = grades.reduce((acc, g) => {
    const subj = g.subject_name
    if (!acc[subj]) acc[subj] = {}
    acc[subj][g.exam_type] = g
    return acc
  }, {})

  const tabs = ['profile', 'subjects', 'attendance', 'marks']

  return (
    <div>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          {student.full_name?.charAt(0).toUpperCase()}
        </div>
        <div style={{flex:1}}>
          <h2 style={styles.heading}>{student.full_name}</h2>
          <div style={styles.metaRow}>
            <span style={styles.roleBadge}>Student</span>
            <span style={styles.meta}>{student.email}</span>
            <span style={styles.meta}>Roll: {student.roll_number}</span>
            <span style={styles.meta}>Sem {student.semester}</span>
            <span style={styles.meta}>Batch {student.batch_year}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{...styles.tab, ...(activeTab === tab ? styles.tabActive : {})}}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Profile tab ──────────────────────────────── */}
      {activeTab === 'profile' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Student Profile</div>
          <InfoRow label="Full Name"   value={student.full_name} />
          <InfoRow label="Email"       value={student.email} />
          <InfoRow label="Roll Number" value={student.roll_number} />
          <InfoRow label="Department"  value={student.department_name} />
          <InfoRow label="Semester"    value={`Semester ${student.semester}`} />
          <InfoRow label="Batch Year"  value={student.batch_year} />
        </div>
      )}

      {/* ── Subjects tab ─────────────────────────────── */}
      {activeTab === 'subjects' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Enrolled Subjects ({enrollments.length})
          </div>
          {enrollments.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Enrolled On</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((en, idx) => (
                  <tr key={en.id}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>{en.class_name}</td>
                    <td style={styles.td}>
                      {new Date(en.enrolled_at).toLocaleDateString('en-IN', {
                        day:'2-digit', month:'short', year:'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={styles.empty}>No subjects enrolled.</p>
          )}
        </div>
      )}

      {/* ── Attendance tab ────────────────────────────── */}
      {activeTab === 'attendance' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Attendance Summary</div>
          {Object.entries(attBySubject).length > 0 ? (
            Object.entries(attBySubject).map(([subj, data]) => {
              const pct = data.total > 0
                ? Math.round((data.present / data.total) * 100) : 0
              const col = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'
              const bg  = pct >= 75 ? '#f0fdf4' : pct >= 50 ? '#fffbeb' : '#fef2f2'
              return (
                <div key={subj} style={{...styles.attCard, backgroundColor: bg}}>
                  <div style={styles.attHeader}>
                    <span style={styles.attSubj}>{subj}</span>
                    <span style={{...styles.attPct, color: col}}>{pct}%</span>
                  </div>
                  <div style={styles.attBarTrack}>
                    <div style={{
                      ...styles.attBarFill,
                      width: `${pct}%`,
                      backgroundColor: col,
                    }} />
                  </div>
                  <div style={styles.attMeta}>
                    <span style={{color:'#16a34a', fontWeight:'500'}}>
                      Present: {data.present}
                    </span>
                    <span style={{color:'#dc2626', fontWeight:'500'}}>
                      Absent: {data.absent}
                    </span>
                    <span style={{color:'#64748b'}}>
                      Total: {data.total}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <p style={styles.empty}>No attendance records found.</p>
          )}
        </div>
      )}

      {/* ── Marks tab ─────────────────────────────────── */}
      {activeTab === 'marks' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Marks</div>
          {Object.entries(gradeBySubject).length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Internal 1</th>
                  <th style={styles.th}>Internal 2</th>
                  <th style={styles.th}>Assignment</th>
                  <th style={styles.th}>Final</th>
                  <th style={styles.th}>Overall %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(gradeBySubject).map(([subj, examMap]) => {
                  const all     = Object.values(examMap)
                  const totMark = all.reduce((s,g) => s + parseFloat(g.marks    || 0), 0)
                  const totMax  = all.reduce((s,g) => s + parseFloat(g.max_marks || 0), 0)
                  const overall = totMax > 0 ? Math.round((totMark / totMax) * 100) : null
                  const col     = overall !== null
                    ? overall >= 75 ? '#16a34a' : overall >= 50 ? '#d97706' : '#dc2626'
                    : '#94a3b8'

                  const fmt = (key) => examMap[key]
                    ? (
                      <span>
                        {examMap[key].marks}
                        <span style={{color:'#94a3b8'}}>/{examMap[key].max_marks}</span>
                      </span>
                    ) : <span style={{color:'#e2e8f0'}}>—</span>

                  return (
                    <tr key={subj}>
                      <td style={styles.td}>{subj}</td>
                      <td style={styles.td}>{fmt('internal1')}</td>
                      <td style={styles.td}>{fmt('internal2')}</td>
                      <td style={styles.td}>{fmt('assignment')}</td>
                      <td style={styles.td}>{fmt('final')}</td>
                      <td style={styles.td}>
                        {overall !== null ? (
                          <span style={{color: col, fontWeight:'600'}}>{overall}%</span>
                        ) : (
                          <span style={{color:'#94a3b8'}}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p style={styles.empty}>No marks recorded yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{display:'flex', padding:'10px 0', borderBottom:'1px solid #f1f5f9'}}>
      <span style={{width:'160px', color:'#64748b', fontSize:'14px'}}>{label}</span>
      <span style={{color:'#0f172a', fontSize:'14px', fontWeight:'500'}}>{value || '—'}</span>
    </div>
  )
}

const styles = {
  backBtn:     { background:'none', border:'1px solid #e2e8f0', borderRadius:'6px',
                 padding:'6px 14px', cursor:'pointer', color:'#64748b',
                 fontSize:'14px', marginBottom:'20px' },
  header:      { display:'flex', alignItems:'center', gap:'16px', backgroundColor:'#fff',
                 padding:'20px 24px', borderRadius:'12px', border:'1px solid #e2e8f0',
                 marginBottom:'16px' },
  avatar:      { width:'52px', height:'52px', borderRadius:'50%', backgroundColor:'#2563eb',
                 display:'flex', alignItems:'center', justifyContent:'center',
                 color:'#fff', fontSize:'22px', fontWeight:'700', flexShrink:0 },
  heading:     { fontSize:'20px', fontWeight:'600', color:'#0f172a', margin:'0 0 8px 0' },
  metaRow:     { display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' },
  roleBadge:   { backgroundColor:'#2563eb', color:'#fff', padding:'3px 10px',
                 borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
  meta:        { fontSize:'13px', color:'#64748b' },
  tabRow:      { display:'flex', gap:'4px', marginBottom:'16px',
                 backgroundColor:'#f1f5f9', padding:'4px', borderRadius:'8px',
                 width:'fit-content' },
  tab:         { padding:'8px 20px', border:'none', borderRadius:'6px', cursor:'pointer',
                 fontSize:'14px', fontWeight:'500', backgroundColor:'transparent',
                 color:'#64748b' },
  tabActive:   { backgroundColor:'#fff', color:'#0f172a',
                 boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  card:        { backgroundColor:'#fff', padding:'20px', borderRadius:'12px',
                 border:'1px solid #e2e8f0', marginBottom:'16px' },
  cardTitle:   { fontSize:'13px', fontWeight:'600', color:'#94a3b8', textTransform:'uppercase',
                 letterSpacing:'0.05em', marginBottom:'16px' },
  table:       { width:'100%', borderCollapse:'collapse' },
  th:          { textAlign:'left', padding:'10px 14px', fontSize:'13px', color:'#64748b',
                 backgroundColor:'#f8fafc', borderBottom:'1px solid #f1f5f9' },
  td:          { padding:'10px 14px', fontSize:'14px', color:'#374151',
                 borderBottom:'1px solid #f8fafc' },
  empty:       { color:'#94a3b8', fontSize:'14px', padding:'8px 0' },
  attCard:     { padding:'14px', borderRadius:'8px', marginBottom:'10px' },
  attHeader:   { display:'flex', justifyContent:'space-between',
                 alignItems:'center', marginBottom:'8px' },
  attSubj:     { fontSize:'14px', fontWeight:'500', color:'#0f172a' },
  attPct:      { fontSize:'18px', fontWeight:'700' },
  attBarTrack: { height:'8px', backgroundColor:'rgba(0,0,0,0.08)',
                 borderRadius:'4px', overflow:'hidden', marginBottom:'8px' },
  attBarFill:  { height:'100%', borderRadius:'4px', transition:'width 0.5s' },
  attMeta:     { display:'flex', gap:'16px', fontSize:'13px' },
}