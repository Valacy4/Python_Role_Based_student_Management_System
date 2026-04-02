// src/pages/hod/Teachers.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function HODTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading,  setLoading]  = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/teachers/')
      .then(res => setTeachers(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 style={styles.heading}>Teachers in My Department</h2>
      <p style={styles.sub}>Click on a teacher to view their details and classes</p>

      {loading ? <p>Loading...</p> : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Specialization</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, idx) => (
                <tr
                  key={t.id}
                  style={styles.tr}
                  onClick={() => navigate(`/hod/teachers/${t.id}`)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    <div style={styles.nameRow}>
                      <div style={styles.avatar}>
                        {t.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={styles.name}>{t.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{t.email}</td>
                  <td style={styles.td}>
                    <span style={styles.empBadge}>{t.employee_id}</span>
                  </td>
                  <td style={styles.td}>{t.specialization || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {teachers.length === 0 && (
            <p style={{color:'#64748b', padding:'16px'}}>No teachers found.</p>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  heading: { fontSize:'22px', fontWeight:'600', color:'#0f172a', marginBottom:'4px' },
  sub:     { color:'#64748b', fontSize:'14px', marginBottom:'20px' },
  card:    { backgroundColor:'#fff', borderRadius:'10px', border:'1px solid #e2e8f0', overflow:'hidden' },
  table:   { width:'100%', borderCollapse:'collapse' },
  th:      { textAlign:'left', padding:'12px 16px', fontSize:'13px', color:'#64748b',
             borderBottom:'1px solid #f1f5f9', backgroundColor:'#f8fafc' },
  tr:      { cursor:'pointer', transition:'background 0.1s' },
  td:      { padding:'12px 16px', fontSize:'14px', color:'#374151', borderBottom:'1px solid #f8fafc' },
  nameRow: { display:'flex', alignItems:'center', gap:'10px' },
  avatar:  { width:'32px', height:'32px', borderRadius:'50%', backgroundColor:'#0d9488',
             display:'flex', alignItems:'center', justifyContent:'center',
             color:'#fff', fontWeight:'600', fontSize:'13px', flexShrink:0 },
  name:    { fontWeight:'500', color:'#0f172a' },
  empBadge:{ backgroundColor:'#f1f5f9', color:'#475569', padding:'3px 8px',
             borderRadius:'4px', fontSize:'12px', fontWeight:'500' },
}