import { useEffect, useState } from 'react'
import API from '../../api/axios'

export default function TeacherAttendance() {
  const [classes,     setClasses]     = useState([])
  const [selectedCls, setSelectedCls] = useState('')
  const [enrollments, setEnrollments] = useState([])
  const [date,        setDate]        = useState(new Date().toISOString().split('T')[0])
  const [attendance,  setAttendance]  = useState({})  // { enrollmentId: 'present'|'absent'|'late' }
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)

  // Load teacher's classes
  useEffect(() => {
    API.get('/classes/my-classes/').then(res => setClasses(res.data))
  }, [])

  // Load enrollments when class is selected
  useEffect(() => {
    if (!selectedCls) return
    API.get(`/enrollments/?format=json`)
      .then(res => {
        const filtered = res.data.filter(e => e.cls === parseInt(selectedCls))
        setEnrollments(filtered)
        // Default everyone to present
        const defaults = {}
        filtered.forEach(e => { defaults[e.id] = 'present' })
        setAttendance(defaults)
      })
  }, [selectedCls])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      // Post one attendance record per student
      await Promise.all(
        enrollments.map(e =>
          API.post('/attendance/', {
            enrollment: e.id,
            date:       date,
            status:     attendance[e.id],
          })
        )
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert('Some records failed — they may already exist for this date.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 style={styles.heading}>Mark Attendance</h2>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.field}>
          <label style={styles.label}>Select Class</label>
          <select value={selectedCls} onChange={e => setSelectedCls(e.target.value)} style={styles.select}>
            <option value="">-- Choose a class --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.subject_name}</option>
            ))}
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.select} />
        </div>
      </div>

      {saved && <div style={styles.success}>Attendance saved successfully!</div>}

      {/* Student list */}
      {selectedCls && enrollments.length > 0 && (
        <>
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Roll No</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(e => (
                  <tr key={e.id}>
                    <td style={styles.td}>{e.student_name}</td>
                    <td style={styles.td}>{e.roll_number}</td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        {['present', 'absent', 'late'].map(status => (
                          <button
                            key={status}
                            onClick={() => setAttendance(prev => ({...prev, [e.id]: status}))}
                            style={{
                              ...styles.statusBtn,
                              backgroundColor:
                                attendance[e.id] === status
                                  ? status === 'present' ? '#16a34a'
                                  : status === 'absent'  ? '#dc2626' : '#d97706'
                                  : '#f1f5f9',
                              color: attendance[e.id] === status ? '#fff' : '#374151',
                            }}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handleSubmit} disabled={saving} style={styles.submitBtn}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </>
      )}

      {selectedCls && enrollments.length === 0 && (
        <p style={{color:'#64748b'}}>No students enrolled in this class yet.</p>
      )}
    </div>
  )
}

const styles = {
  heading:   { fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '24px' },
  controls:  { display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' },
  field:     { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:     { fontSize: '14px', fontWeight: '500', color: '#374151' },
  select:    { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px',
               fontSize: '14px', minWidth: '200px' },
  success:   { backgroundColor: '#dcfce7', color: '#16a34a', padding: '10px 14px',
               borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  card:      { backgroundColor: '#fff', borderRadius: '10px',
               border: '1px solid #e2e8f0', marginBottom: '16px', overflow: 'hidden' },
  table:     { width: '100%', borderCollapse: 'collapse' },
  th:        { textAlign: 'left', padding: '12px 16px', fontSize: '13px',
               color: '#64748b', borderBottom: '1px solid #f1f5f9',
               backgroundColor: '#f8fafc' },
  td:        { padding: '12px 16px', fontSize: '14px', color: '#374151',
               borderBottom: '1px solid #f8fafc' },
  btnGroup:  { display: 'flex', gap: '6px' },
  statusBtn: { padding: '4px 12px', border: 'none', borderRadius: '4px',
               cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  submitBtn: { padding: '10px 28px', backgroundColor: '#4f46e5', color: '#fff',
               border: 'none', borderRadius: '6px', fontSize: '15px',
               fontWeight: '500', cursor: 'pointer' },
}