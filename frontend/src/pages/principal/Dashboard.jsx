// src/pages/principal/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'

export default function PrincipalDashboard() {
  const { user }    = useAuth()
  const [stats, setStats] = useState({
    total_users: 0, principals: 0, hods: 0,
    teachers: 0, students: 0,
    departments: 0, subjects: 0,
    classes: 0, enrollments: 0,
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/auth/users/'),
      API.get('/departments/'),
      API.get('/subjects/'),
      API.get('/classes/'),
      API.get('/enrollments/'),
    ]).then(([usersRes, deptsRes, subjRes, clsRes, enrRes]) => {
      const users = usersRes.data
      setStats({
        total_users:  users.length,
        principals:   users.filter(u => u.role === 'principal').length,
        hods:         users.filter(u => u.role === 'hod').length,
        teachers:     users.filter(u => u.role === 'teacher').length,
        students:     users.filter(u => u.role === 'student').length,
        departments:  deptsRes.data.length,
        subjects:     subjRes.data.length,
        classes:      clsRes.data.length,
        enrollments:  enrRes.data.length,
      })
      // Show 5 most recent users
      setRecentUsers(users.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Departments', value: stats.departments,  color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'HODs',        value: stats.hods,         color: '#d97706', bg: '#fffbeb' },
    { label: 'Teachers',    value: stats.teachers,     color: '#0d9488', bg: '#f0fdfa' },
    { label: 'Students',    value: stats.students,     color: '#2563eb', bg: '#eff6ff' },
    { label: 'Subjects',    value: stats.subjects,     color: '#db2777', bg: '#fdf2f8' },
    { label: 'Classes',     value: stats.classes,      color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Enrollments', value: stats.enrollments,  color: '#dc2626', bg: '#fef2f2' },
    { label: 'Total Users', value: stats.total_users,  color: '#475569', bg: '#f8fafc' },
  ]

  const roleColors = {
    principal: '#7c3aed', hod: '#d97706',
    teacher: '#0d9488',   student: '#2563eb',
  }

  return (
    <div>
      <h2 style={styles.heading}>Welcome, {user?.full_name}</h2>
      <p style={styles.sub}>System overview — all departments</p>

      {loading ? <p style={{color:'#64748b'}}>Loading stats...</p> : (
        <>
          {/* Stats grid */}
          <div style={styles.grid}>
            {cards.map(card => (
              <div key={card.label} style={{...styles.card, backgroundColor: card.bg}}>
                <div style={{...styles.cardValue, color: card.color}}>{card.value}</div>
                <div style={{...styles.cardLabel, color: card.color}}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Recent users */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Recent Users</h3>
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u.id}>
                      <td style={styles.td}>{u.first_name} {u.last_name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: roleColors[u.role] || '#64748b'
                        }}>
                          {u.role}
                        </span>
                      </td>
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
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '16px', marginBottom: '32px' },
  card:         { padding: '20px', borderRadius: '10px', textAlign: 'center' },
  cardValue:    { fontSize: '36px', fontWeight: '700', marginBottom: '4px' },
  cardLabel:    { fontSize: '13px', fontWeight: '500' },
  section:      { marginBottom: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' },
  tableCard:    { backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { textAlign: 'left', padding: '12px 16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' },
  td:           { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f8fafc' },
  badge:        { color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
}