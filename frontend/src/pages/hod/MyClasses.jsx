// src/pages/hod/MyClasses.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'
import Spinner from '../../components/Spinner'
import ErrorBanner from '../../components/ErrorBanner'

export default function HODMyClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [hovered, setHovered] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/classes/my-classes/')
      .then(res => setClasses(res.data))
      .catch(() => setError('Could not load your classes.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner text="Loading your classes..." />

  return (
    <div>
      <h2 style={styles.heading}>My Teaching Classes</h2>
      <p style={styles.sub}>
        Click on a class to view and manage students.
      </p>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

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
            onClick={() => navigate(`/hod/my-classes/${cls.id}`)}
            onMouseEnter={() => setHovered(cls.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={styles.code}>
              {cls.subject_name.split(' - ')[0]}
            </div>
            <div style={styles.name}>
              {cls.subject_name.split(' - ')[1] || cls.subject_name}
            </div>
            <div style={styles.year}>{cls.academic_year}</div>
            <div style={styles.cardFooter}>
              <span style={{
                ...styles.badge,
                backgroundColor: cls.is_active ? '#16a34a' : '#94a3b8'
              }}>
                {cls.is_active ? 'Active' : 'Inactive'}
              </span>
              <span style={styles.viewDetail}>View students →</span>
            </div>
          </div>
        ))}

        {classes.length === 0 && !error && (
          <div style={styles.empty}>
            No classes assigned to you yet. Contact the principal to get assigned.
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  heading:    { fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' },
  sub:        { color: '#64748b', marginBottom: '24px', fontSize: '14px' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' },
  card:       { backgroundColor: '#fff', padding: '20px', borderRadius: '10px',
                border: '1px solid #e2e8f0', cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s' },
  code:       { fontSize: '13px', color: '#d97706', fontWeight: '600', marginBottom: '4px' },
  name:       { fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' },
  year:       { fontSize: '13px', color: '#64748b', marginBottom: '12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge:      { color: '#fff', padding: '3px 10px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '500', display: 'inline-block' },
  viewDetail: { fontSize: '12px', color: '#d97706', fontWeight: '500' },
  empty:      { color: '#64748b', padding: '20px', backgroundColor: '#fff',
                borderRadius: '10px', border: '1px solid #e2e8f0' },
}