// src/pages/principal/Departments.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function PrincipalDepartments() {
  const [departments, setDepartments] = useState([])
  const [subjects,    setSubjects]    = useState([])
  const [teachers,    setTeachers]    = useState([])
  const [students,    setStudents]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [search,      setSearch]      = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      API.get('/departments/'),
      API.get('/subjects/'),
      API.get('/auth/users/by-role/teacher/'),
      API.get('/auth/users/by-role/student/'),
    ]).then(([deptRes, subjRes, teachRes, studRes]) => {
      setDepartments(deptRes.data)
      setSubjects(subjRes.data)
      setTeachers(teachRes.data)
      setStudents(studRes.data)
    }).catch(() => setError('Could not load departments.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p style={{padding:'32px', color:'#64748b'}}>Loading...</p>

  return (
    <div>
      {/* Header */}
      <div style={styles.topRow}>
        <div>
          <h2 style={styles.heading}>Departments</h2>
          <p style={styles.sub}>{departments.length} departments in the system</p>
        </div>
        <input
          placeholder="Search departments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />
      </div>

      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* Department cards */}
      <div style={styles.grid}>
        {filtered.map((dept, idx) => {
          const deptSubjects = subjects.filter(s => s.department === dept.id)
          const colors = [
            { bg: '#f5f3ff', border: '#ddd6fe', accent: '#7c3aed' },
            { bg: '#fff7ed', border: '#fed7aa', accent: '#d97706' },
            { bg: '#f0fdfa', border: '#99f6e4', accent: '#0d9488' },
            { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb' },
          ]
          const color = colors[idx % colors.length]

          return (
            <div key={dept.id} style={{...styles.card, backgroundColor: color.bg, borderColor: color.border}}>
              {/* Card header */}
              <div style={styles.cardHeader}>
                <div style={{...styles.deptIcon, backgroundColor: color.accent}}>
                  {dept.name.charAt(0)}
                </div>
                <div>
                  <div style={{...styles.deptName, color: color.accent}}>{dept.name}</div>
                  <div style={styles.hodName}>
                    HOD: {dept.hod_name || 'Not assigned'}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={styles.statsRow}>
                <div style={styles.stat}>
                  <span style={{...styles.statNum, color: color.accent}}>
                    {deptSubjects.length}
                  </span>
                  <span style={styles.statLabel}>Subjects</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <span style={{...styles.statNum, color: color.accent}}>
                    {students.length > 0
                      ? Math.round(students.length / departments.length)
                      : 0
                    }
                  </span>
                  <span style={styles.statLabel}>Students</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <span style={{...styles.statNum, color: color.accent}}>
                    {teachers.length > 0
                      ? Math.round(teachers.length / departments.length)
                      : 0
                    }
                  </span>
                  <span style={styles.statLabel}>Teachers</span>
                </div>
              </div>

              {/* Subjects list */}
              {deptSubjects.length > 0 && (
                <div style={styles.subjectSection}>
                  <div style={styles.subjectTitle}>
                    Subjects offered
                  </div>
                  <div style={styles.subjectList}>
                    {deptSubjects.map(s => (
                      <div
                        key={s.id}
                        style={{
                          ...styles.subjectChip,
                          borderColor: color.border,
                          cursor: 'pointer',        // ← shows pointer on hover
                        }}
                        onClick={() => navigate(`/principal/subjects/${s.id}`)}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.95)'
                          e.currentTarget.style.borderColor = color.accent
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.7)'
                          e.currentTarget.style.borderColor = color.border
                        }}
                      >
                        <span style={{color: color.accent, fontWeight:'600', fontSize:'11px'}}>
                          {s.code}
                        </span>
                        <span style={styles.subjectChipName}>{s.name}</span>
                        <span style={styles.semBadge}>Sem {s.semester}</span>
                        <span style={{fontSize:'11px', color: color.accent, fontWeight:'600'}}>→</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && !error && (
        <p style={{color:'#64748b'}}>No departments found.</p>
      )}
    </div>
  )
}

const styles = {
  topRow:         { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' },
  heading:        { fontSize:'22px', fontWeight:'600', color:'#0f172a', margin:0 },
  sub:            { color:'#64748b', fontSize:'14px', marginTop:'4px' },
  search:         { padding:'8px 14px', border:'1px solid #e2e8f0', borderRadius:'8px',
                    fontSize:'14px', width:'240px', outline:'none' },
  errorMsg:       { backgroundColor:'#fef2f2', color:'#dc2626', padding:'10px 16px',
                    borderRadius:'8px', marginBottom:'16px', fontSize:'14px' },
  grid:           { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px,1fr))', gap:'20px' },
  card:           { borderRadius:'12px', border:'1px solid', padding:'20px' },
  cardHeader:     { display:'flex', alignItems:'center', gap:'14px', marginBottom:'16px' },
  deptIcon:       { width:'44px', height:'44px', borderRadius:'10px', display:'flex',
                    alignItems:'center', justifyContent:'center', color:'#fff',
                    fontSize:'20px', fontWeight:'700', flexShrink:0 },
  deptName:       { fontSize:'16px', fontWeight:'700' },
  hodName:        { fontSize:'13px', color:'#64748b', marginTop:'2px' },
  statsRow:       { display:'flex', alignItems:'center', padding:'12px 0',
                    borderTop:'1px solid rgba(0,0,0,0.06)', borderBottom:'1px solid rgba(0,0,0,0.06)',
                    marginBottom:'16px' },
  stat:           { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' },
  statNum:        { fontSize:'22px', fontWeight:'700' },
  statLabel:      { fontSize:'11px', color:'#94a3b8', fontWeight:'500',
                    textTransform:'uppercase', letterSpacing:'0.05em' },
  statDivider:    { width:'1px', height:'32px', backgroundColor:'rgba(0,0,0,0.08)' },
  subjectSection: { marginTop:'4px' },
  subjectTitle:   { fontSize:'12px', fontWeight:'600', color:'#94a3b8',
                    textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px' },
  subjectList:    { display:'flex', flexDirection:'column', gap:'6px' },
  subjectChip:    { display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px',
                    backgroundColor:'rgba(255,255,255,0.7)', borderRadius:'6px',
                    border:'1px solid', transition:'all 0.15s' },
  subjectChipName:{ flex:1, fontSize:'13px', color:'#374151', fontWeight:'500' },
  semBadge:       { fontSize:'11px', color:'#94a3b8', backgroundColor:'rgba(0,0,0,0.05)',
                    padding:'2px 6px', borderRadius:'4px' },
}
