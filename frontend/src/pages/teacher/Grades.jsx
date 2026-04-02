// src/pages/teacher/Grades.jsx
import { useEffect, useState } from 'react'
import API from '../../api/axios'
import { validateGrade } from '../../utils/validate'

export default function TeacherGrades() {
  const [classes,     setClasses]     = useState([])
  const [selectedCls, setSelectedCls] = useState('')
  const [enrollments, setEnrollments] = useState([])
  const [form,        setForm]        = useState({
    enrollment: '', exam_type: 'internal1',
    marks: '', max_marks: '50', remarks: ''
  })
  const [grades,      setGrades]      = useState([])
  const [saved,       setSaved]       = useState(false)
  const [formErrors,  setFormErrors]  = useState({})   // ← moved inside component
  const [apiError,    setApiError]    = useState('')    // ← new: shows API errors inline

  useEffect(() => {
    API.get('/classes/my-classes/').then(res => setClasses(res.data))
    API.get('/grades/').then(res => setGrades(res.data))
  }, [])

  useEffect(() => {
    if (!selectedCls) return
    API.get('/enrollments/').then(res => {
      setEnrollments(res.data.filter(e => e.cls === parseInt(selectedCls)))
    })
  }, [selectedCls])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    // Run validation before hitting the API
    const errors = validateGrade(form)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return   // stop here — don't call API
    }
    setFormErrors({})  // clear old errors if all valid

    try {
      const res = await API.post('/grades/', form)
      setGrades(prev => [res.data, ...prev])
      setForm({ enrollment:'', exam_type:'internal1', marks:'', max_marks:'50', remarks:'' })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      // Show API error inline instead of alert()
      setApiError(
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Failed to save grade. Please try again.'
      )
    }
  }

  const classGrades = grades.filter(g =>
    enrollments.some(e => e.id === g.enrollment)
  )

  return (
    <div>
      <h2 style={styles.heading}>Manage Grades</h2>

      {/* Class selector */}
      <div style={styles.field}>
        <label style={styles.label}>Select Class</label>
        <select
          value={selectedCls}
          onChange={e => setSelectedCls(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Choose a class --</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.subject_name}</option>
          ))}
        </select>
      </div>

      {selectedCls && (
        <>
          {/* Add grade form */}
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Add Grade</h3>

            {/* Success message */}
            {saved && (
              <div style={styles.success}>Grade saved successfully!</div>
            )}

            {/* API error message — shown inline instead of alert */}
            {apiError && (
              <div style={styles.errorMsg}>{apiError}</div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>

                {/* Student select */}
                <div style={styles.field}>
                  <label style={styles.label}>Student</label>
                  <select
                    value={form.enrollment}
                    onChange={e => {
                      setForm({...form, enrollment: e.target.value})
                      setFormErrors(p => ({...p, enrollment: ''}))
                    }}
                    style={{
                      ...styles.select,
                      ...(formErrors.enrollment ? styles.inputError : {})
                    }}
                  >
                    <option value="">-- Select student --</option>
                    {enrollments.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.student_name} ({e.roll_number})
                      </option>
                    ))}
                  </select>
                  {/* Validation error shown under the field */}
                  {formErrors.enrollment && (
                    <span style={styles.fieldError}>{formErrors.enrollment}</span>
                  )}
                </div>

                {/* Exam type */}
                <div style={styles.field}>
                  <label style={styles.label}>Exam Type</label>
                  <select
                    value={form.exam_type}
                    onChange={e => setForm({...form, exam_type: e.target.value})}
                    style={styles.select}
                  >
                    <option value="internal1">Internal 1</option>
                    <option value="internal2">Internal 2</option>
                    <option value="assignment">Assignment</option>
                    <option value="final">Final Exam</option>
                  </select>
                </div>

                {/* Marks */}
                <div style={styles.field}>
                  <label style={styles.label}>Marks</label>
                  <input
                    type="number"
                    value={form.marks}
                    onChange={e => {
                      setForm({...form, marks: e.target.value})
                      setFormErrors(p => ({...p, marks: ''}))
                    }}
                    style={{
                      ...styles.input,
                      ...(formErrors.marks ? styles.inputError : {})
                    }}
                    placeholder="0"
                  />
                  {formErrors.marks && (
                    <span style={styles.fieldError}>{formErrors.marks}</span>
                  )}
                </div>

                {/* Max marks */}
                <div style={styles.field}>
                  <label style={styles.label}>Max Marks</label>
                  <input
                    type="number"
                    value={form.max_marks}
                    onChange={e => {
                      setForm({...form, max_marks: e.target.value})
                      setFormErrors(p => ({...p, max_marks: ''}))
                    }}
                    style={{
                      ...styles.input,
                      ...(formErrors.max_marks ? styles.inputError : {})
                    }}
                    placeholder="50"
                  />
                  {formErrors.max_marks && (
                    <span style={styles.fieldError}>{formErrors.max_marks}</span>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div style={styles.field}>
                <label style={styles.label}>Remarks</label>
                <input
                  value={form.remarks}
                  onChange={e => setForm({...form, remarks: e.target.value})}
                  style={{...styles.input, width: '100%'}}
                  placeholder="Optional remarks"
                />
              </div>

              <button type="submit" style={styles.submitBtn}>
                Save Grade
              </button>
            </form>
          </div>

          {/* Grades table */}
          {/* Grades table — grouped by student */}
{classGrades.length > 0 && (
  <div style={styles.card}>
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Student</th>
          <th style={styles.th}>Roll No</th>
          <th style={styles.th}>Internal 1</th>
          <th style={styles.th}>Internal 2</th>
          <th style={styles.th}>Assignment</th>
          <th style={styles.th}>Final</th>
          <th style={styles.th}>Overall %</th>
        </tr>
      </thead>
      <tbody>
        {enrollments.map(en => {
          const enGrades   = classGrades.filter(g => g.enrollment === en.id)
          const internal1  = enGrades.find(g => g.exam_type === 'internal1')
          const internal2  = enGrades.find(g => g.exam_type === 'internal2')
          const assignment = enGrades.find(g => g.exam_type === 'assignment')
          const final      = enGrades.find(g => g.exam_type === 'final')

          const totalMarks = enGrades.reduce((s,g) => s + parseFloat(g.marks    || 0), 0)
          const totalMax   = enGrades.reduce((s,g) => s + parseFloat(g.max_marks || 0), 0)
          const overall    = totalMax > 0 ? Math.round((totalMarks/totalMax)*100) : null
          const col        = overall !== null
            ? overall >= 75 ? '#16a34a' : overall >= 50 ? '#d97706' : '#dc2626'
            : '#94a3b8'

          const fmt = (g) => g
            ? <span>{g.marks}<span style={{color:'#94a3b8'}}>/{g.max_marks}</span></span>
            : <span style={{color:'#e2e8f0'}}>—</span>

          if (enGrades.length === 0) return null

          return (
            <tr key={en.id}>
              <td style={styles.td}>{en.student_name}</td>
              <td style={styles.td}>
                <span style={styles.rollBadge}>{en.roll_number}</span>
              </td>
              <td style={styles.td}>{fmt(internal1)}</td>
              <td style={styles.td}>{fmt(internal2)}</td>
              <td style={styles.td}>{fmt(assignment)}</td>
              <td style={styles.td}>{fmt(final)}</td>
              <td style={styles.td}>
                {overall !== null ? (
                  <span style={{color:col, fontWeight:'600'}}>{overall}%</span>
                ) : (
                  <span style={{color:'#94a3b8'}}>—</span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)}
        </>
      )}
    </div>
  )
}

const styles = {
  heading:    { fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '24px' },
  formCard:   { backgroundColor: '#fff', padding: '20px', borderRadius: '10px',
                border: '1px solid #e2e8f0', marginBottom: '20px' },
  formTitle:  { fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' },
  form:       { display: 'flex', flexDirection: 'column', gap: '12px' },
  formRow:    { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  field:      { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:      { fontSize: '14px', fontWeight: '500', color: '#374151' },
  select:     { padding: '8px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '14px' },
  input:      { padding: '8px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '14px', width: '100px' },
  inputError: { borderColor: '#dc2626', backgroundColor: '#fff5f5' },
  fieldError: { color: '#dc2626', fontSize: '12px' },
  success:    { backgroundColor: '#dcfce7', color: '#16a34a', padding: '8px 12px',
                borderRadius: '6px', marginBottom: '12px', fontSize: '14px' },
  errorMsg:   { backgroundColor: '#fef2f2', color: '#dc2626', padding: '8px 12px',
                borderRadius: '6px', marginBottom: '12px', fontSize: '14px',
                border: '1px solid #fecaca' },
  submitBtn:  { padding: '10px 24px', backgroundColor: '#4f46e5', color: '#fff',
                border: 'none', borderRadius: '6px', fontWeight: '500',
                cursor: 'pointer', alignSelf: 'flex-start' },
  card:       { backgroundColor: '#fff', borderRadius: '10px',
                border: '1px solid #e2e8f0', overflow: 'hidden' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { textAlign: 'left', padding: '12px 16px', fontSize: '13px',
                color: '#64748b', borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#f8fafc' },
  td:         { padding: '12px 16px', fontSize: '14px', color: '#374151',
                borderBottom: '1px solid #f8fafc' },
  rollBadge: { backgroundColor:'#f1f5f9', color:'#475569', padding:'3px 8px',
             borderRadius:'4px', fontSize:'12px', fontWeight:'500' },
}
