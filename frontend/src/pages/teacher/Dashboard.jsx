// src/pages/teacher/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'

export default function TeacherDashboard() {
  const { user }                = useAuth()
  const [classes,    setClasses]    = useState([])
  const [enrollments,setEnrollments]= useState([])
  const [grades,     setGrades]     = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/classes/my-classes/'),
      API.get('/enrollments/'),
      API.get('/grades/'),
      API.get('/attendance/'),
    ]).then(([clsRes, enrRes, grRes, attRes]) => {
      setClasses(clsRes.data)
      setEnrollments(enrRes.data)
      setGrades(grRes.data)
      setAttendance(attRes.data)
    }).finally(() => setLoading(false))
  }, [])

  // Total unique students across all classes
  const uniqueStudents = [...new Set(enrollments.map(e => e.student))].length

  // Attendance summary
  const presentCount = attendance.filter(a => a.status === 'present').length
  const totalAtt     = attendance.length
  const attPct       = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0

  const cards = [
    { label: 'My Classes',    value: classes.length,   color: '#0d9488', bg: '#f0fdfa' },
    { label: 'My Students',   value: uniqueStudents,   color: '#2563eb', bg: '#eff6ff' },
    { label: 'Grades Added',  value: grades.length,    color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Avg Attendance',value: `${attPct}%`,     color: '#d97706', bg: '#fffbeb' },
  ]

  return (
    <div>
      <h2 style={styles.heading}>Welcome, {user?.full_name}</h2>
      <p style={styles.sub}>Your teaching overview</p>

      {loading ? <p style={{color:'#64748b'}}>Loading...</p> : (
        <>
          {/* Stats */}
          <div style={styles.grid}>
            {cards.map(card => (
              <div key={card.label} style={{...styles.card, backgroundColor: card.bg}}>
                <div style={{...styles.cardValue, color: card.color}}>{card.value}</div>
                <div style={{...styles.cardLabel, color: card.color}}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Classes breakdown */}
          <h3 style={styles.sectionTitle}>My Classes</h3>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Academic Year</th>
                  <th style={styles.th}>Students Enrolled</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => {
                  const enrolled = enrollments.filter(e => e.cls === cls.id).length
                  return (
                    <tr key={cls.id}>
                      <td style={styles.td}>
                        <div style={{fontWeight:'500'}}>{cls.subject_name.split(' - ')[1] || cls.subject_name}</div>
                        <div style={{fontSize:'12px', color:'#94a3b8'}}>{cls.subject_name.split(' - ')[0]}</div>
                      </td>
                      <td style={styles.td}>{cls.academic_year}</td>
                      <td style={styles.td}>
                        <span style={styles.countBadge}>{enrolled} students</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: cls.is_active ? '#dcfce7' : '#f1f5f9',
                          color: cls.is_active ? '#16a34a' : '#64748b',
                        }}>
                          {cls.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {classes.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{...styles.td, color:'#94a3b8', textAlign:'center'}}>
                      No classes assigned yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recent grades */}
          {grades.length > 0 && (
            <>
              <h3 style={{...styles.sectionTitle, marginTop:'24px'}}>Recently Added Grades</h3>
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Student</th>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Exam</th>
                      <th style={styles.th}>Marks</th>
                      <th style={styles.th}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.slice(0, 5).map(g => (
                      <tr key={g.id}>
                        <td style={styles.td}>{g.student_name}</td>
                        <td style={styles.td}>{g.subject_name}</td>
                        <td style={styles.td}>{g.exam_type}</td>
                        <td style={styles.td}>{g.marks}/{g.max_marks}</td>
                        <td style={styles.td}>
                          <span style={{
                            fontWeight: '600',
                            color: g.percentage >= 75 ? '#16a34a'
                                 : g.percentage >= 50 ? '#d97706'
                                 : '#dc2626'
                          }}>
                            {g.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  heading:      { fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' },
  sub:          { color: '#64748b', marginBottom: '28px', fontSize: '14px' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' },
  card:         { padding: '20px', borderRadius: '10px', textAlign: 'center' },
  cardValue:    { fontSize: '36px', fontWeight: '700', marginBottom: '4px' },
  cardLabel:    { fontSize: '13px', fontWeight: '500' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' },
  tableCard:    { backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { textAlign: 'left', padding: '12px 16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' },
  td:           { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f8fafc' },
  countBadge:   { backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  statusBadge:  { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
}