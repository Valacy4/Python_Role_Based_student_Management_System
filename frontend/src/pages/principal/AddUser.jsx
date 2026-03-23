// src/pages/principal/AddUser.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'

const INITIAL_FORM = {
  first_name:     '',
  last_name:      '',
  email:          '',
  username:       '',
  password:       '',
  role:           'student',
  phone:          '',
  employee_id:    '',
  specialization: '',
  department:     '',
  roll_number:    '',
  semester:       '1',
  batch_year:     new Date().getFullYear().toString(),
}

export default function AddUser() {
  const navigate = useNavigate()
  const [form,        setForm]        = useState(INITIAL_FORM)
  const [departments, setDepartments] = useState([])
  const [errors,      setErrors]      = useState({})
  const [apiError,    setApiError]    = useState('')
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    API.get('/departments/').then(res => setDepartments(res.data))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!form.first_name.trim()) err.first_name = 'First name is required'
    if (!form.last_name.trim())  err.last_name  = 'Last name is required'
    if (!form.email.trim())      err.email      = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Enter a valid email'
    if (!form.username.trim())   err.username   = 'Username is required'
    if (!form.password.trim())   err.password   = 'Password is required'
    else if (form.password.length < 8) err.password = 'Minimum 8 characters'
    if (!form.phone.trim())      err.phone      = 'Phone is required'
    else if (!/^\d{10}$/.test(form.phone)) err.phone = 'Must be 10 digits'

    if (['teacher', 'hod'].includes(form.role)) {
      if (!form.employee_id.trim()) err.employee_id = 'Employee ID is required'
      if (!form.department)         err.department  = 'Department is required'
    }
    if (form.role === 'student') {
      if (!form.roll_number.trim()) err.roll_number = 'Roll number is required'
      if (!form.department)         err.department  = 'Department is required'
      if (!form.semester)           err.semester    = 'Semester is required'
      if (!form.batch_year)         err.batch_year  = 'Batch year is required'
    }
    return err
  }

  // Helper to extract readable error from API response
  const extractError = (data) => {
    if (!data) return 'Unknown error'
    if (typeof data === 'string') return data
    if (data.detail) return data.detail
    if (data.error)  return data.error
    // Show all field errors
    return Object.entries(data)
      .map(([key, val]) => `${key}: ${Array.isArray(val) ? val[0] : val}`)
      .join(' | ')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setErrors({})

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    let newUser = null

    try {
      // ── Step 1: Create user account ──────────────────
      const userRes = await API.post('/auth/users/', {
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        username:   form.username,
        password:   form.password,
        role:       form.role,
        phone:      form.phone,
      })
      newUser = userRes.data

      // ── Step 2: Create profile ────────────────────────
      if (['teacher', 'hod'].includes(form.role)) {
        await API.post('/teachers/', {
          user:           newUser.id,
          department:     parseInt(form.department),
          employee_id:    form.employee_id,
          specialization: form.specialization,
        })

        // ── Step 3: Assign HOD to department ─────────────
        if (form.role === 'hod') {
          await API.patch(`/departments/${form.department}/`, {
            hod: newUser.id
          })
        }
      }

      if (form.role === 'student') {
        await API.post('/students/', {
          user:        newUser.id,
          department:  parseInt(form.department),
          roll_number: form.roll_number,
          semester:    parseInt(form.semester),
          batch_year:  parseInt(form.batch_year),
        })
      }

      // ── All steps passed ──────────────────────────────
      navigate('/principal/users', {
        state: { success: `${form.first_name} ${form.last_name} added successfully!` }
      })

    } catch (err) {
      console.error('AddUser error:', err.response?.data)
      const data = err.response?.data

      // If user was created but profile failed — clean up the user
      if (newUser) {
        try {
          await API.delete(`/auth/users/${newUser.id}/`)
          setApiError(
            `Profile creation failed and user was cleaned up. ` +
            `Error: ${extractError(data)}`
          )
        } catch {
          // Cleanup also failed — tell principal to delete manually
          setApiError(
            `Profile creation failed. ` +
            `Please delete user "@${form.username}" from the Users page manually. ` +
            `Error: ${extractError(data)}`
          )
        }
      } else {
        // User creation itself failed
        if (data?.email)    setErrors(p => ({...p, email:    data.email[0]}))
        if (data?.username) setErrors(p => ({...p, username: data.username[0]}))
        setApiError(`User creation failed: ${extractError(data)}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const isTeacherOrHOD = ['teacher', 'hod'].includes(form.role)
  const isStudent      = form.role === 'student'

  return (
    <div>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back
      </button>

      <h2 style={styles.heading}>Add New User</h2>
      <p style={styles.sub}>Fill in all required fields based on the role</p>

      {apiError && (
        <div style={styles.apiError}>
          <strong>Error:</strong> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>

        {/* Basic Info */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Basic Information</div>
          <div style={styles.grid2}>
            <Field label="First Name *" name="first_name" value={form.first_name} onChange={handleChange} error={errors.first_name} placeholder="e.g. Rahul" />
            <Field label="Last Name *"  name="last_name"  value={form.last_name}  onChange={handleChange} error={errors.last_name}  placeholder="e.g. Kumar" />
            <Field label="Email *"      name="email"      value={form.email}      onChange={handleChange} error={errors.email}      placeholder="rahul@sms.com" type="email" />
            <Field label="Phone *"      name="phone"      value={form.phone}      onChange={handleChange} error={errors.phone}      placeholder="10 digit number" />
          </div>
        </div>

        {/* Account Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Account Details</div>
          <div style={styles.grid2}>
            <Field label="Username *" name="username" value={form.username} onChange={handleChange} error={errors.username} placeholder="e.g. rahul_kumar" />
            <Field label="Password *" name="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Min 8 characters" type="password" />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Role *</label>
            <div style={styles.roleRow}>
              {['student', 'teacher', 'hod', 'principal'].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setForm(prev => ({...prev, role}))
                    setErrors({})
                    setApiError('')
                  }}
                  style={{
                    ...styles.roleBtn,
                    ...(form.role === role ? styles.roleBtnActive : {}),
                    ...(form.role === role ? roleColors[role] : {}),
                  }}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Teacher / HOD Profile */}
        {isTeacherOrHOD && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              {form.role === 'hod' ? 'HOD' : 'Teacher'} Profile
            </div>
            <div style={styles.grid2}>
              <Field label="Employee ID *"  name="employee_id"    value={form.employee_id}    onChange={handleChange} error={errors.employee_id}    placeholder="e.g. CS_T006" />
              <Field label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} error={errors.specialization} placeholder="e.g. Data Science" />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Department *</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                style={{...styles.input, ...(errors.department ? styles.inputError : {})}}
              >
                <option value="">-- Select Department --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.department && <span style={styles.fieldError}>{errors.department}</span>}
            </div>
            {form.role === 'hod' && (
              <div style={styles.infoNote}>
                This person will be assigned as HOD of the selected department.
                The existing HOD will be replaced.
              </div>
            )}
          </div>
        )}

        {/* Student Profile */}
        {isStudent && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Student Profile</div>
            <div style={styles.grid2}>
              <Field label="Roll Number *" name="roll_number" value={form.roll_number} onChange={handleChange} error={errors.roll_number} placeholder="e.g. CS2024001" />
              <Field label="Batch Year *"  name="batch_year"  value={form.batch_year}  onChange={handleChange} error={errors.batch_year}  placeholder="e.g. 2024" type="number" />
            </div>
            <div style={styles.grid2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Semester *</label>
                <select
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  style={{...styles.input, ...(errors.semester ? styles.inputError : {})}}
                >
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
                {errors.semester && <span style={styles.fieldError}>{errors.semester}</span>}
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Department *</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  style={{...styles.input, ...(errors.department ? styles.inputError : {})}}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.department && <span style={styles.fieldError}>{errors.department}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div style={styles.submitRow}>
          <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" disabled={saving} style={{
            ...styles.submitBtn,
            opacity: saving ? 0.7 : 1,
            cursor:  saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Creating...' : `Create ${form.role.charAt(0).toUpperCase() + form.role.slice(1)}`}
          </button>
        </div>

      </form>
    </div>
  )
}

function Field({ label, name, value, onChange, error, placeholder, type = 'text' }) {
  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{...styles.input, ...(error ? styles.inputError : {})}}
      />
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  )
}

const roleColors = {
  principal: { backgroundColor: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  hod:       { backgroundColor: '#d97706', color: '#fff', borderColor: '#d97706' },
  teacher:   { backgroundColor: '#0d9488', color: '#fff', borderColor: '#0d9488' },
  student:   { backgroundColor: '#2563eb', color: '#fff', borderColor: '#2563eb' },
}

const styles = {
  backBtn:      { background:'none', border:'1px solid #e2e8f0', borderRadius:'6px',
                  padding:'6px 14px', cursor:'pointer', color:'#64748b',
                  fontSize:'14px', marginBottom:'20px' },
  heading:      { fontSize:'22px', fontWeight:'600', color:'#0f172a', marginBottom:'4px' },
  sub:          { color:'#64748b', fontSize:'14px', marginBottom:'28px' },
  apiError:     { backgroundColor:'#fef2f2', color:'#dc2626', padding:'12px 16px',
                  borderRadius:'8px', marginBottom:'20px', fontSize:'14px',
                  border:'1px solid #fecaca', lineHeight:'1.5' },
  form:         { maxWidth:'720px' },
  section:      { backgroundColor:'#fff', padding:'24px', borderRadius:'12px',
                  border:'1px solid #e2e8f0', marginBottom:'16px' },
  sectionTitle: { fontSize:'13px', fontWeight:'600', color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'16px' },
  grid2:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' },
  fieldGroup:   { display:'flex', flexDirection:'column', gap:'6px', marginBottom:'12px' },
  label:        { fontSize:'14px', fontWeight:'500', color:'#374151' },
  input:        { padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:'6px',
                  fontSize:'14px', outline:'none', width:'100%', boxSizing:'border-box' },
  inputError:   { borderColor:'#dc2626', backgroundColor:'#fff5f5' },
  fieldError:   { color:'#dc2626', fontSize:'12px' },
  roleRow:      { display:'flex', gap:'10px', flexWrap:'wrap' },
  roleBtn:      { padding:'8px 20px', border:'1px solid #e2e8f0', borderRadius:'6px',
                  cursor:'pointer', fontSize:'14px', backgroundColor:'#f8fafc',
                  color:'#64748b', fontWeight:'500' },
  roleBtnActive:{ fontWeight:'600' },
  infoNote:     { backgroundColor:'#fffbeb', border:'1px solid #fde68a', borderRadius:'6px',
                  padding:'10px 14px', fontSize:'13px', color:'#92400e', marginTop:'8px' },
  submitRow:    { display:'flex', gap:'12px', justifyContent:'flex-end', marginTop:'8px' },
  cancelBtn:    { padding:'10px 24px', backgroundColor:'#f1f5f9', color:'#374151',
                  border:'1px solid #e2e8f0', borderRadius:'6px', cursor:'pointer',
                  fontWeight:'500', fontSize:'14px' },
  submitBtn:    { padding:'10px 28px', backgroundColor:'#4f46e5', color:'#fff',
                  border:'none', borderRadius:'6px', fontWeight:'500', fontSize:'14px' },
}
