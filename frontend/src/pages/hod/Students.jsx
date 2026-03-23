import { useEffect, useState } from 'react'
import API from '../../api/axios'

export default function HODStudents() {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    API.get('/students/')
      .then(res => setStudents(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={styles.topRow}>
        <h2 style={styles.heading}>Students in My Department</h2>
        <input
          placeholder="Search by name or roll no..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Roll Number</th>
                <th style={styles.th}>Semester</th>
                <th style={styles.th}>Batch Year</th>
                <th style={styles.th}>Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={styles.td}>{s.full_name}</td>
                  <td style={styles.td}>{s.roll_number}</td>
                  <td style={styles.td}>Sem {s.semester}</td>
                  <td style={styles.td}>{s.batch_year}</td>
                  <td style={styles.td}>{s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{color:'#64748b', padding:'16px'}}>No students found.</p>}
        </div>
      )}
    </div>
  )
}

const styles = {
  topRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { fontSize: '22px', fontWeight: '600', color: '#0f172a', margin: 0 },
  search:  { padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '260px' },
  card:    { backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table:   { width: '100%', borderCollapse: 'collapse' },
  th:      { textAlign: 'left', padding: '12px 16px', fontSize: '13px',
             color: '#64748b', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' },
  td:      { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f8fafc' },
}