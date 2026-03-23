import { useEffect, useState } from 'react'
import API from '../../api/axios'

export default function StudentMarks() {
  const [grades,  setGrades]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/grades/')
      .then(res => setGrades(res.data))
      .finally(() => setLoading(false))
  }, [])

  // Group grades by subject
  const grouped = grades.reduce((acc, grade) => {
    const subject = grade.subject_name
    if (!acc[subject]) acc[subject] = []
    acc[subject].push(grade)
    return acc
  }, {})

  const examTypeLabel = {
    internal1:  'Internal 1',
    internal2:  'Internal 2',
    assignment: 'Assignment',
    final:      'Final Exam',
  }

  return (
    <div>
      <h2 style={styles.heading}>My Marks</h2>

      {loading ? <p>Loading...</p> : (
        Object.entries(grouped).map(([subject, gradeList]) => {
          const totalMarks = gradeList.reduce((sum, g) => sum + parseFloat(g.marks), 0)
          const totalMax   = gradeList.reduce((sum, g) => sum + parseFloat(g.max_marks), 0)
          const overall    = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0

          return (
            <div key={subject} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.subjectName}>{subject}</span>
                <span style={{...styles.badge,
                  backgroundColor: overall >= 75 ? '#16a34a' : overall >= 50 ? '#d97706' : '#dc2626'
                }}>
                  Overall: {overall}%
                </span>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Exam</th>
                    <th style={styles.th}>Marks</th>
                    <th style={styles.th}>Max</th>
                    <th style={styles.th}>Percentage</th>
                    <th style={styles.th}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeList.map(g => (
                    <tr key={g.id}>
                      <td style={styles.td}>{examTypeLabel[g.exam_type] || g.exam_type}</td>
                      <td style={styles.td}>{g.marks}</td>
                      <td style={styles.td}>{g.max_marks}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.pctBadge,
                          color: g.percentage >= 75 ? '#16a34a' : g.percentage >= 50 ? '#d97706' : '#dc2626'
                        }}>
                          {g.percentage}%
                        </span>
                      </td>
                      <td style={{...styles.td, color:'#94a3b8', fontSize:'13px'}}>{g.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })
      )}
      {!loading && Object.keys(grouped).length === 0 && (
        <p style={{color:'#64748b'}}>No marks recorded yet.</p>
      )}
    </div>
  )
}

const styles = {
  heading:     { fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '24px' },
  card:        { backgroundColor: '#fff', padding: '20px', borderRadius: '10px',
                 border: '1px solid #e2e8f0', marginBottom: '20px' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between',
                 alignItems: 'center', marginBottom: '16px' },
  subjectName: { fontWeight: '600', fontSize: '16px', color: '#0f172a' },
  badge:       { color: '#fff', fontSize: '13px', fontWeight: '500',
                 padding: '4px 10px', borderRadius: '20px' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { textAlign: 'left', padding: '8px 12px', fontSize: '13px',
                 color: '#64748b', borderBottom: '1px solid #f1f5f9' },
  td:          { padding: '10px 12px', fontSize: '14px', color: '#374151',
                 borderBottom: '1px solid #f8fafc' },
  pctBadge:    { fontWeight: '600' },
}