import { useEffect, useState } from 'react'
import API from '../../api/axios'

export default function StudentAttendance() {
  const [records,  setRecords]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    API.get('/attendance/')
      .then(res => setRecords(res.data))
      .finally(() => setLoading(false))
  }, [])

  // Group attendance records by subject
  const grouped = records.reduce((acc, record) => {
    const subject = record.subject_name
    if (!acc[subject]) acc[subject] = { present: 0, absent: 0, late: 0, records: [] }
    acc[subject][record.status]++
    acc[subject].records.push(record)
    return acc
  }, {})

  return (
    <div>
      <h2 style={styles.heading}>My Attendance</h2>

      {loading ? <p>Loading...</p> : (
        Object.entries(grouped).map(([subject, data]) => {
          const total      = data.present + data.absent + data.late
          const percentage = total > 0 ? Math.round((data.present / total) * 100) : 0
          const color      = percentage >= 75 ? '#16a34a' : percentage >= 50 ? '#d97706' : '#dc2626'

          return (
            <div key={subject} style={styles.card}>
              {/* Subject header */}
              <div style={styles.cardHeader}>
                <span style={styles.subjectName}>{subject}</span>
                <span style={{...styles.badge, backgroundColor: color}}>
                  {percentage}% attendance
                </span>
              </div>

              {/* Stats row */}
              <div style={styles.statsRow}>
                <div style={styles.stat}>
                  <span style={{color:'#16a34a', fontWeight:'600'}}>{data.present}</span>
                  <span style={styles.statLabel}>Present</span>
                </div>
                <div style={styles.stat}>
                  <span style={{color:'#dc2626', fontWeight:'600'}}>{data.absent}</span>
                  <span style={styles.statLabel}>Absent</span>
                </div>
                <div style={styles.stat}>
                  <span style={{color:'#d97706', fontWeight:'600'}}>{data.late}</span>
                  <span style={styles.statLabel}>Late</span>
                </div>
                <div style={styles.stat}>
                  <span style={{color:'#6366f1', fontWeight:'600'}}>{total}</span>
                  <span style={styles.statLabel}>Total</span>
                </div>
              </div>

              {/* Record table */}
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map(r => (
                    <tr key={r.id}>
                      <td style={styles.td}>{r.date}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            r.status === 'present' ? '#dcfce7' :
                            r.status === 'absent'  ? '#fee2e2' : '#fef9c3',
                          color:
                            r.status === 'present' ? '#16a34a' :
                            r.status === 'absent'  ? '#dc2626' : '#ca8a04',
                        }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })
      )}
      {!loading && Object.keys(grouped).length === 0 && (
        <p style={{color:'#64748b'}}>No attendance records found.</p>
      )}
    </div>
  )
}

const styles = {
  heading:      { fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '24px' },
  card:         { backgroundColor: '#fff', padding: '20px', borderRadius: '10px',
                  border: '1px solid #e2e8f0', marginBottom: '20px' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '16px' },
  subjectName:  { fontWeight: '600', fontSize: '16px', color: '#0f172a' },
  badge:        { color: '#fff', fontSize: '13px', fontWeight: '500',
                  padding: '4px 10px', borderRadius: '20px' },
  statsRow:     { display: 'flex', gap: '24px', marginBottom: '16px',
                  paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' },
  stat:         { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  statLabel:    { fontSize: '12px', color: '#94a3b8' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { textAlign: 'left', padding: '8px 12px', fontSize: '13px',
                  color: '#64748b', borderBottom: '1px solid #f1f5f9' },
  td:           { padding: '8px 12px', fontSize: '14px', color: '#374151',
                  borderBottom: '1px solid #f8fafc' },
  statusBadge:  { padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' },
}