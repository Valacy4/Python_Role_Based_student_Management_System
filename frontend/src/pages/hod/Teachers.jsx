import { useEffect, useState } from 'react'
import API from '../../api/axios'

export default function HODTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    API.get('/teachers/')
      .then(res => setTeachers(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 style={styles.heading}>Teachers in My Department</h2>
      {loading ? <p>Loading...</p> : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Specialization</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t.id}>
                  <td style={styles.td}>{t.full_name}</td>
                  <td style={styles.td}>{t.email}</td>
                  <td style={styles.td}>{t.employee_id}</td>
                  <td style={styles.td}>{t.specialization || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {teachers.length === 0 && <p style={{color:'#64748b', padding:'16px'}}>No teachers found.</p>}
        </div>
      )}
    </div>
  )
}

const styles = {
  heading: { fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '24px' },
  card:    { backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table:   { width: '100%', borderCollapse: 'collapse' },
  th:      { textAlign: 'left', padding: '12px 16px', fontSize: '13px',
             color: '#64748b', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' },
  td:      { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f8fafc' },
}