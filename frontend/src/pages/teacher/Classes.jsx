// src/pages/teacher/Classes.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function TeacherClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/classes/my-classes/')
      .then(res => setClasses(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 style={styles.heading}>My Classes</h2>
      <p style={styles.sub}>Click on a class to view and manage students</p>

      {loading ? <p style={{color:'#64748b'}}>Loading...</p> : (
        <div style={styles.grid}>
          {classes.map(cls => (
            <div
              key={cls.id}
              style={{
                ...styles.card,
                boxShadow: hovered === cls.id
                  ? '0 4px 16px rgba(0,0,0,0.10)'
                  : '0 1px 4px rgba(0,0,0,0.05)',
                transform: hovered === cls.id ? 'translateY(-2px)' : 'none',
              }}
              onClick={() => navigate(`/teacher/classes/${cls.id}`)}
              onMouseEnter={() => setHovered(cls.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={styles.subjectCode}>
                {cls.subject_name.split(' - ')[0]}
              </div>
              <div style={styles.subjectName}>
                {cls.subject_name.split(' - ')[1] || cls.subject_name}
              </div>
              <div style={styles.year}>{cls.academic_year}</div>
              <div style={styles.cardFooter}>
                <div style={{
                  ...styles.statusDot,
                  backgroundColor: cls.is_active ? '#16a34a' : '#94a3b8'
                }}>
                  {cls.is_active ? 'Active' : 'Inactive'}
                </div>
                <span style={styles.viewDetail}>View students →</span>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <p style={{color:'#64748b'}}>No classes assigned yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  heading:     { fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' },
  sub:         { color: '#64748b', marginBottom: '24px', fontSize: '14px' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' },
  card:        { backgroundColor: '#fff', padding: '20px', borderRadius: '10px',
                 border: '1px solid #e2e8f0', cursor: 'pointer',
                 transition: 'box-shadow 0.2s, transform 0.2s' },
  subjectCode: { fontSize: '13px', color: '#6366f1', fontWeight: '600', marginBottom: '4px' },
  subjectName: { fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' },
  year:        { fontSize: '13px', color: '#64748b', marginBottom: '12px' },
  cardFooter:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusDot:   { display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                 color: '#fff', fontSize: '12px', fontWeight: '500' },
  viewDetail:  { fontSize: '12px', color: '#6366f1', fontWeight: '500' },
}