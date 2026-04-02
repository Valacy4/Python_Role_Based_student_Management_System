// src/pages/principal/UserDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function UserDetail() {
  const { id }                        = useParams()
  const navigate                      = useNavigate()
  const [user,        setUser]        = useState(null)
  const [profile,     setProfile]     = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [attendance,  setAttendance]  = useState([])
  const [grades,      setGrades]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState('profile')

  useEffect(() => {
    API.get(`/auth/users/${id}/`)
      .then(async userRes => {
        const u = userRes.data
        setUser(u)

        if (u.role === 'student') {
          const [enrRes, attRes, grRes, stuRes] = await Promise.all([
            API.get('/enrollments/'),
            API.get('/attendance/'),
            API.get('/grades/'),
            API.get('/students/'),
          ])
          const sp = stuRes.data.find(s => s.user === parseInt(id))
          setProfile(sp || null)

          if (sp) {
            const enr = enrRes.data.filter(e => e.student === sp.id)
            setEnrollments(enr)
            const enrIds = enr.map(e => e.id)
            setAttendance(attRes.data.filter(a => enrIds.includes(a.enrollment)))
            setGrades(grRes.data.filter(g => enrIds.includes(g.enrollment)))
          }
        } else if (['teacher', 'hod'].includes(u.role)) {
          const teachRes = await API.get('/teachers/')
          const tp = teachRes.data.find(t => t.user === parseInt(id))
          setProfile(tp || null)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p style={{padding:'32px', color:'#64748b'}}>Loading...</p>
  if (!user)   return <p style={{padding:'32px', color:'#dc2626'}}>User not found.</p>

  const roleColors = {
    principal:'#7c3aed', hod:'#d97706', teacher:'#0d9488', student:'#2563eb'
  }

  // Group attendance by subject
  const attBySubject = attendance.reduce((acc, a) => {
    const subj = a.subject_name
    if (!acc[subj]) acc[subj] = { present:0, absent:0, total:0 }
    acc[subj][a.status === 'present' ? 'present' : 'absent']++
    acc[subj].total++
    return acc
  }, {})

  // Group grades by student (for the table view)
  const gradeByEnrollment = grades.reduce((acc, g) => {
    const key = g.subject_name
    if (!acc[key]) acc[key] = {}
    acc[key][g.exam_type] = g
    return acc
  }, {})

  const isStudent = user.role === 'student'

  return (
    <div>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>

      {/* User header */}
      <div style={styles.header}>
        <div style={{...styles.avatar, backgroundColor: roleColors[user.role] || '#64748b'}}>
          {(user.first_name || '?').charAt(0).toUpperCase()}
        </div>
        <div style={{flex:1}}>
          <h2 style={styles.heading}>{user.first_name} {user.last_name}</h2>
          <div style={styles.metaRow}>
            <span style={{...styles.roleBadge, backgroundColor: roleColors[user.role]}}>
              {user.role}
            </span>
            <span style={styles.meta}>@{user.username}</span>
            <span style={styles.meta}>{user.email}</span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2',
              color: user.is_active ? '#16a34a' : '#dc2626',
            }}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/principal/edit-user/${id}`)}
          style={styles.editBtn}
        >
          Edit User
        </button>
      </div>

      {/* Tabs — only show for students */}
      {isStudent && (
        <div style={styles.tabRow}>
          {['profile', 'subjects', 'attendance', 'marks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {})
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* ── Profile tab ─────────────────────────────── */}
      {(activeTab === 'profile' || !isStudent) && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            {isStudent ? 'Student Profile' : `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Profile`}
          </div>
          <div style={styles.infoGrid}>
            <InfoRow label="Full Name" value={`${user.first_name} ${user.last_name}`} />
            <InfoRow label="Email"     value={user.email} />
            <InfoRow label="Phone"     value={user.phone || '—'} />
            {isStudent && profile && (
              <>
                <InfoRow label="Roll Number"  value={profile.roll_number} />
                <InfoRow label="Department"   value={profile.department_name} />
                <InfoRow label="Semester"     value={`Semester ${profile.semester}`} />
                <InfoRow label="Batch Year"   value={profile.batch_year} />
              </>
            )}
            {['teacher','hod'].includes(user.role) && profile && (
              <>
                <InfoRow label="Employee ID"    value={profile.employee_id} />
                <InfoRow label="Specialization" value={profile.specialization || '—'} />
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Subjects tab ────────────────────────────── */}
      {isStudent && activeTab === 'subjects' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Enrolled Subjects ({enrollments.length})</div>
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
          ) : <p style={styles.empty}>No subjects enrolled.</p>}
        </div>
      )}

      {/* ── Attendance tab ───────────────────────────── */}
      {isStudent && activeTab === 'attendance' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Attendance Summary</div>
          {Object.entries(attBySubject).map(([subj, data]) => {
            const pct = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
            const col = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'
            return (
              <div key={subj} style={styles.attCard}>
                <div style={styles.attHeader}>
                  <span style={styles.attSubj}>{subj}</span>
                  <span style={{...styles.attPct, color: col}}>{pct}%</span>
                </div>
                <div style={styles.attBarTrack}>
                  <div style={{...styles.attBarFill, width:`${pct}%`, backgroundColor: col}} />
                </div>
                <div style={styles.attMeta}>
                  <span style={{color:'#16a34a'}}>Present: {data.present}</span>
                  <span style={{color:'#dc2626'}}>Absent: {data.absent}</span>
                  <span style={{color:'#64748b'}}>Total: {data.total}</span>
                </div>
              </div>
            )
          })}
          {Object.keys(attBySubject).length === 0 && (
            <p style={styles.empty}>No attendance records.</p>
          )}
        </div>
      )}

      {/* ── Marks tab ────────────────────────────────── */}
      {isStudent && activeTab === 'marks' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Marks</div>
          {Object.entries(gradeByEnrollment).length > 0 ? (
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
                {Object.entries(gradeByEnrollment).map(([subj, examMap]) => {
                  const all      = Object.values(examMap)
                  const totMarks = all.reduce((s,g) => s + parseFloat(g.marks), 0)
                  const totMax   = all.reduce((s,g) => s + parseFloat(g.max_marks), 0)
                  const overall  = totMax > 0 ? Math.round((totMarks/totMax)*100) : 0
                  const col      = overall >= 75 ? '#16a34a' : overall >= 50 ? '#d97706' : '#dc2626'

                  const fmt = (key) => examMap[key]
                    ? `${examMap[key].marks}/${examMap[key].max_marks}`
                    : '—'

                  return (
                    <tr key={subj}>
                      <td style={styles.td}>{subj}</td>
                      <td style={styles.td}>{fmt('internal1')}</td>
                      <td style={styles.td}>{fmt('internal2')}</td>
                      <td style={styles.td}>{fmt('assignment')}</td>
                      <td style={styles.td}>{fmt('final')}</td>
                      <td style={styles.td}>
                        <span style={{color:col, fontWeight:'600'}}>{overall}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : <p style={styles.empty}>No marks recorded.</p>}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{display:'flex', padding:'10px 0', borderBottom:'1px solid #f1f5f9'}}>
      <span style={{width:'140px', color:'#64748b', fontSize:'14px'}}>{label}</span>
      <span style={{color:'#0f172a', fontSize:'14px', fontWeight:'500'}}>{value || '—'}</span>
    </div>
  )
}

const styles = {
  backBtn:    { background:'none', border:'1px solid #e2e8f0', borderRadius:'6px',
                padding:'6px 14px', cursor:'pointer', color:'#64748b',
                fontSize:'14px', marginBottom:'20px' },
  header:     { display:'flex', alignItems:'center', gap:'16px', backgroundColor:'#fff',
                padding:'20px 24px', borderRadius:'12px', border:'1px solid #e2e8f0',
                marginBottom:'16px' },
  avatar:     { width:'52px', height:'52px', borderRadius:'50%', display:'flex',
                alignItems:'center', justifyContent:'center', color:'#fff',
                fontSize:'22px', fontWeight:'700', flexShrink:0 },
  heading:    { fontSize:'20px', fontWeight:'600', color:'#0f172a', margin:'0 0 8px 0' },
  metaRow:    { display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' },
  roleBadge:  { color:'#fff', padding:'3px 10px', borderRadius:'20px',
                fontSize:'12px', fontWeight:'500' },
  meta:       { fontSize:'13px', color:'#64748b' },
  statusBadge:{ padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
  editBtn:    { padding:'8px 18px', backgroundColor:'#4f46e5', color:'#fff', border:'none',
                borderRadius:'6px', cursor:'pointer', fontSize:'13px', fontWeight:'500',
                flexShrink:0 },
  tabRow:     { display:'flex', gap:'4px', marginBottom:'16px',
                backgroundColor:'#f1f5f9', padding:'4px', borderRadius:'8px',
                width:'fit-content' },
  tab:        { padding:'8px 20px', border:'none', borderRadius:'6px', cursor:'pointer',
                fontSize:'14px', fontWeight:'500', backgroundColor:'transparent',
                color:'#64748b' },
  tabActive:  { backgroundColor:'#fff', color:'#0f172a',
                boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  card:       { backgroundColor:'#fff', padding:'20px', borderRadius:'12px',
                border:'1px solid #e2e8f0', marginBottom:'16px' },
  cardTitle:  { fontSize:'14px', fontWeight:'600', color:'#94a3b8', textTransform:'uppercase',
                letterSpacing:'0.05em', marginBottom:'16px' },
  infoGrid:   {},
  table:      { width:'100%', borderCollapse:'collapse' },
  th:         { textAlign:'left', padding:'10px 14px', fontSize:'13px', color:'#64748b',
                backgroundColor:'#f8fafc', borderBottom:'1px solid #f1f5f9' },
  td:         { padding:'10px 14px', fontSize:'14px', color:'#374151',
                borderBottom:'1px solid #f8fafc' },
  empty:      { color:'#94a3b8', fontSize:'14px', padding:'12px 0' },
  attCard:    { padding:'14px 0', borderBottom:'1px solid #f1f5f9' },
  attHeader:  { display:'flex', justifyContent:'space-between', marginBottom:'8px' },
  attSubj:    { fontSize:'14px', fontWeight:'500', color:'#0f172a' },
  attPct:     { fontSize:'16px', fontWeight:'700' },
  attBarTrack:{ height:'8px', backgroundColor:'#f1f5f9', borderRadius:'4px',
                overflow:'hidden', marginBottom:'6px' },
  attBarFill: { height:'100%', borderRadius:'4px', transition:'width 0.5s' },
  attMeta:    { display:'flex', gap:'16px', fontSize:'12px' },
}