// src/pages/teacher/Attendance.jsx
import { useEffect, useState } from 'react'
import API from '../../api/axios'

export default function TeacherAttendance() {
  const [classes,      setClasses]      = useState([])
  const [selectedCls,  setSelectedCls]  = useState('')
  const [enrollments,  setEnrollments]  = useState([])
  const [date,         setDate]         = useState(new Date().toISOString().split('T')[0])
  const [attendance,   setAttendance]   = useState({})
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [error,        setError]        = useState('')
  const [viewTab,      setViewTab]      = useState('mark')   // 'mark' or 'view'
  const [allRecords,   setAllRecords]   = useState([])
  const [filterDate,   setFilterDate]   = useState('')
  const [loadingRecs,  setLoadingRecs]  = useState(false)

  useEffect(() => {
    API.get('/classes/my-classes/').then(res => setClasses(res.data))
  }, [])

  useEffect(() => {
    if (!selectedCls) return
    API.get('/enrollments/').then(res => {
      const filtered = res.data.filter(e => e.cls === parseInt(selectedCls))
      setEnrollments(filtered)
      const defaults = {}
      filtered.forEach(e => { defaults[e.id] = 'present' })
      setAttendance(defaults)
    })
    // Load all attendance records for this class
    loadAllRecords()
  }, [selectedCls])

  const loadAllRecords = () => {
    if (!selectedCls) return
    setLoadingRecs(true)
    API.get('/attendance/').then(res => {
      // Filter records belonging to this class
      setAllRecords(res.data.filter(a =>
        enrollments.find(e => e.id === a.enrollment) ||
        a.enrollment // we'll re-filter after enrollments load
      ))
    }).finally(() => setLoadingRecs(false))
  }

  useEffect(() => {
    if (enrollments.length > 0 && selectedCls) {
      const enrIds = enrollments.map(e => e.id)
      API.get('/attendance/').then(res => {
        setAllRecords(res.data.filter(a => enrIds.includes(a.enrollment)))
      })
    }
  }, [enrollments])

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    try {
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
      // Reload records after saving
      const enrIds = enrollments.map(e => e.id)
      API.get('/attendance/').then(res => {
        setAllRecords(res.data.filter(a => enrIds.includes(a.enrollment)))
      })
    } catch {
      setError('Some records failed — they may already exist for this date.')
    } finally {
      setSaving(false)
    }
  }

  // Get unique dates from all records
  const uniqueDates = [...new Set(allRecords.map(r => r.date))].sort((a,b) => b.localeCompare(a))

  // Filter records by selected date
  const recordsForDate = filterDate
    ? allRecords.filter(r => r.date === filterDate)
    : []

  // Build attendance matrix: student → date → status
  const attMatrix = enrollments.reduce((acc, en) => {
    acc[en.id] = {}
    allRecords.filter(r => r.enrollment === en.id).forEach(r => {
      acc[en.id][r.date] = r.status
    })
    return acc
  }, {})

  const statusColor = (s) =>
    s === 'present' ? '#16a34a' : s === 'absent' ? '#dc2626' : '#94a3b8'

  const statusBg = (s) =>
    s === 'present' ? '#dcfce7' : s === 'absent' ? '#fee2e2' : '#f1f5f9'

  return (
    <div>
      <h2 style={styles.heading}>Attendance</h2>

      {/* Class + tab selector */}
      <div style={styles.topRow}>
        <div style={styles.field}>
          <label style={styles.label}>Select Class</label>
          <select value={selectedCls} onChange={e => setSelectedCls(e.target.value)} style={styles.select}>
            <option value="">-- Choose a class --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.subject_name}</option>
            ))}
          </select>
        </div>

        {selectedCls && (
          <div style={styles.tabRow}>
            <button
              onClick={() => setViewTab('mark')}
              style={{...styles.tab, ...(viewTab==='mark' ? styles.tabActive : {})}}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setViewTab('view')}
              style={{...styles.tab, ...(viewTab==='view' ? styles.tabActive : {})}}
            >
              View All Records
            </button>
          </div>
        )}
      </div>

      {/* ── Mark Attendance tab ─────────────────────── */}
      {viewTab === 'mark' && selectedCls && (
        <>
          <div style={styles.field}>
            <label style={styles.label}>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={styles.select}
            />
          </div>

          {saved  && <div style={styles.success}>Attendance saved successfully!</div>}
          {error  && <div style={styles.errorMsg}>{error}</div>}

          {enrollments.length > 0 && (
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
                          {/* Only Present and Absent — Late removed */}
                          <div style={styles.btnGroup}>
                            {['present', 'absent'].map(status => (
                              <button
                                key={status}
                                onClick={() => setAttendance(prev => ({...prev, [e.id]: status}))}
                                style={{
                                  ...styles.statusBtn,
                                  backgroundColor:
                                    attendance[e.id] === status
                                      ? status === 'present' ? '#16a34a' : '#dc2626'
                                      : '#f1f5f9',
                                  color: attendance[e.id] === status ? '#fff' : '#374151',
                                  fontWeight: attendance[e.id] === status ? '600' : '400',
                                }}
                              >
                                {status === 'present' ? 'Present' : 'Absent'}
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
            <p style={{color:'#64748b'}}>No students enrolled in this class.</p>
          )}
        </>
      )}

      {/* ── View All Records tab ────────────────────── */}
      {viewTab === 'view' && selectedCls && (
        <>
          <div style={styles.viewHeader}>
            <div style={styles.field}>
              <label style={styles.label}>Filter by Date</label>
              <select
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                style={styles.select}
              >
                <option value="">-- All dates --</option>
                {uniqueDates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div style={styles.legendRow}>
              <span style={{...styles.legendDot, backgroundColor:'#dcfce7', color:'#16a34a'}}>Present</span>
              <span style={{...styles.legendDot, backgroundColor:'#fee2e2', color:'#dc2626'}}>Absent</span>
            </div>
          </div>

          {/* Date-filtered view */}
          {filterDate && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>
                Attendance for {filterDate}
                <span style={styles.cardSub}>
                  {' '}— {recordsForDate.filter(r=>r.status==='present').length} present,
                  {' '}{recordsForDate.filter(r=>r.status==='absent').length} absent
                </span>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Roll No</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((en, idx) => {
                    const record = recordsForDate.find(r => r.enrollment === en.id)
                    const status = record?.status || 'not marked'
                    return (
                      <tr key={en.id}>
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={styles.td}>{en.student_name}</td>
                        <td style={styles.td}>{en.roll_number}</td>
                        <td style={styles.td}>
                          <span style={{
                            padding:'3px 10px', borderRadius:'20px', fontSize:'12px',
                            fontWeight:'500',
                            backgroundColor: statusBg(status),
                            color: statusColor(status),
                          }}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Full matrix view — student × all dates */}
          {!filterDate && uniqueDates.length > 0 && (
            <div style={{...styles.card, overflowX:'auto'}}>
              <div style={styles.cardTitle}>
                All Attendance Records
                <span style={styles.cardSub}> — {uniqueDates.length} dates recorded</span>
              </div>
              <table style={{...styles.table, minWidth: `${200 + uniqueDates.length * 90}px`}}>
                <thead>
                  <tr>
                    <th style={{...styles.th, minWidth:'160px'}}>Student</th>
                    <th style={{...styles.th, minWidth:'100px'}}>Roll No</th>
                    {uniqueDates.map(d => (
                      <th key={d} style={{...styles.th, minWidth:'90px', textAlign:'center'}}>
                        {d.slice(5)}
                      </th>
                    ))}
                    <th style={{...styles.th, minWidth:'80px', textAlign:'center'}}>
                      Present %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(en => {
                    const present = uniqueDates.filter(d => attMatrix[en.id]?.[d] === 'present').length
                    const total   = uniqueDates.filter(d => attMatrix[en.id]?.[d]).length
                    const pct     = total > 0 ? Math.round((present/total)*100) : 0
                    const pctCol  = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'

                    return (
                      <tr key={en.id}>
                        <td style={styles.td}>{en.student_name}</td>
                        <td style={styles.td}>{en.roll_number}</td>
                        {uniqueDates.map(d => {
                          const s = attMatrix[en.id]?.[d]
                          return (
                            <td key={d} style={{...styles.td, textAlign:'center', padding:'8px'}}>
                              {s ? (
                                <span style={{
                                  display:'inline-block', width:'28px', height:'28px',
                                  borderRadius:'50%', lineHeight:'28px', fontSize:'12px',
                                  fontWeight:'600', textAlign:'center',
                                  backgroundColor: statusBg(s),
                                  color: statusColor(s),
                                }}>
                                  {s === 'present' ? 'P' : 'A'}
                                </span>
                              ) : (
                                <span style={{color:'#e2e8f0', fontSize:'12px'}}>—</span>
                              )}
                            </td>
                          )
                        })}
                        <td style={{...styles.td, textAlign:'center'}}>
                          <span style={{color: pctCol, fontWeight:'600'}}>{pct}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {uniqueDates.length === 0 && (
            <p style={{color:'#64748b'}}>No attendance records yet for this class.</p>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  heading:    { fontSize:'22px', fontWeight:'600', color:'#0f172a', marginBottom:'20px' },
  topRow:     { display:'flex', alignItems:'flex-end', gap:'24px', marginBottom:'20px', flexWrap:'wrap' },
  field:      { display:'flex', flexDirection:'column', gap:'6px' },
  label:      { fontSize:'14px', fontWeight:'500', color:'#374151' },
  select:     { padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:'6px',
                fontSize:'14px', minWidth:'200px' },
  tabRow:     { display:'flex', gap:'4px', backgroundColor:'#f1f5f9',
                padding:'4px', borderRadius:'8px' },
  tab:        { padding:'7px 18px', border:'none', borderRadius:'6px', cursor:'pointer',
                fontSize:'13px', fontWeight:'500', backgroundColor:'transparent', color:'#64748b' },
  tabActive:  { backgroundColor:'#fff', color:'#0f172a',
                boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  success:    { backgroundColor:'#dcfce7', color:'#16a34a', padding:'10px 14px',
                borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
  errorMsg:   { backgroundColor:'#fef2f2', color:'#dc2626', padding:'10px 14px',
                borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
  card:       { backgroundColor:'#fff', borderRadius:'10px', border:'1px solid #e2e8f0',
                marginBottom:'16px', overflow:'hidden' },
  cardTitle:  { padding:'14px 16px', fontSize:'14px', fontWeight:'600', color:'#0f172a',
                borderBottom:'1px solid #f1f5f9' },
  cardSub:    { fontWeight:'400', color:'#64748b', fontSize:'13px' },
  table:      { width:'100%', borderCollapse:'collapse' },
  th:         { textAlign:'left', padding:'10px 16px', fontSize:'13px', color:'#64748b',
                backgroundColor:'#f8fafc', borderBottom:'1px solid #f1f5f9' },
  td:         { padding:'10px 16px', fontSize:'14px', color:'#374151',
                borderBottom:'1px solid #f8fafc' },
  btnGroup:   { display:'flex', gap:'6px' },
  statusBtn:  { padding:'5px 16px', border:'none', borderRadius:'6px',
                cursor:'pointer', fontSize:'13px', transition:'all 0.15s' },
  submitBtn:  { padding:'10px 28px', backgroundColor:'#4f46e5', color:'#fff',
                border:'none', borderRadius:'6px', fontSize:'15px',
                fontWeight:'500', cursor:'pointer' },
  viewHeader: { display:'flex', alignItems:'flex-end', justifyContent:'space-between',
                marginBottom:'16px', flexWrap:'wrap', gap:'12px' },
  legendRow:  { display:'flex', gap:'8px', alignItems:'center' },
  legendDot:  { padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
}