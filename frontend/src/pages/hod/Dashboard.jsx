// src/pages/hod/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'

export default function HODDashboard() {
  const { user }              = useAuth()
  const [teachers,  setTeachers]  = useState([])
  const [students,  setStudents]  = useState([])
  const [classes,   setClasses]   = useState([])
  const [myClasses, setMyClasses] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/teachers/'),
      API.get('/students/'),
      API.get('/classes/'),
      API.get('/classes/my-classes/'),
    ]).then(([tRes, sRes, cRes, mcRes]) => {
      setTeachers(tRes.data)
      setStudents(sRes.data)
      setClasses(cRes.data)
      setMyClasses(mcRes.data)
    }).finally(() => setLoading(false))
  }, [])

  // Group students by semester
  const bySemester = students.reduce((acc, s) => {
    const sem = `Semester ${s.semester}`
    if (!acc[sem]) acc[sem] = 0
    acc[sem]++
    return acc
  }, {})

  const cards = [
    { label: 'Teachers in Dept', value: teachers.length,  color: '#0d9488', bg: '#f0fdfa' },
    { label: 'Students in Dept', value: students.length,  color: '#2563eb', bg: '#eff6ff' },
    { label: 'Total Classes',    value: classes.length,   color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'My Classes',       value: myClasses.length, color: '#d97706', bg: '#fffbeb' },
  ]

  return (
    <div>
      <h2 style={styles.heading}>Welcome, {user?.full_name}</h2>
      <p style={styles.sub}>Department overview</p>

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

          <div style={styles.row}>
            {/* Students by semester */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Students by Semester</h3>
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Semester</th>
                      <th style={styles.th}>Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bySemester).map(([sem, count]) => (
                      <tr key={sem}>
                        <td style={styles.td}>{sem}</td>
                        <td style={styles.td}>
                          <span style={styles.countBadge}>{count}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* My teaching classes */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>My Teaching Classes</h3>
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Year</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myClasses.map(cls => (
                      <tr key={cls.id}>
                        <td style={styles.td}>{cls.subject_name}</td>
                        <td style={styles.td}>{cls.academic_year}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusDot,
                            backgroundColor: cls.is_active ? '#dcfce7' : '#f1f5f9',
                            color: cls.is_active ? '#16a34a' : '#64748b',
                          }}>
                            {cls.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myClasses.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{...styles.td, color:'#94a3b8'}}>
                          No classes assigned yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Teachers list */}
          <div>
            <h3 style={styles.sectionTitle}>Teachers in Department</h3>
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Employee ID</th>
                    <th style={styles.th}>Specialization</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t.id}>
                      <td style={styles.td}>{t.full_name}</td>
                      <td style={styles.td}>{t.employee_id}</td>
                      <td style={styles.td}>{t.specialization || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
  row:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
  section:      {},
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' },
  tableCard:    { backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { textAlign: 'left', padding: '12px 16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' },
  td:           { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f8fafc' },
  countBadge:   { backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  statusDot:    { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
}