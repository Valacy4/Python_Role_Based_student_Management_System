// src/pages/principal/EditUser.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function EditUser() {
  const { id }                    = useParams()
  const navigate                  = useNavigate()
  const [user,       setUser]     = useState(null)
  const [profile,    setProfile]  = useState(null)
  const [form,       setForm]     = useState({})
  const [loading,    setLoading]  = useState(true)
  const [saving,     setSaving]   = useState(false)
  const [success,    setSuccess]  = useState('')
  const [error,      setError]    = useState('')
  const [departments,setDepts]    = useState([])

  useEffect(() => {
    Promise.all([
      API.get(`/auth/users/${id}/`),
      API.get('/departments/'),
    ]).then(async ([userRes, deptRes]) => {
      const u = userRes.data
      setUser(u)
      setDepts(deptRes.data)
      setForm({
        first_name: u.first_name || '',
        last_name:  u.last_name  || '',
        email:      u.email      || '',
        phone:      u.phone      || '',
        is_active:  u.is_active,
      })

      // Load profile based on role
      try {
        if (u.role === 'student') {
          const res = await API.get(`/students/?format=json`)
          const sp = res.data.find(s => s.user === parseInt(id))
          setProfile(sp || null)
        } else if (['teacher', 'hod'].includes(u.role)) {
          const res = await API.get(`/teachers/?format=json`)
          const tp = res.data.find(t => t.user === parseInt(id))
          setProfile(tp || null)
        }
      } catch {
        setProfile(null)
      }
    }).catch(() => setError('Could not load user.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await API.patch(`/auth/users/${id}/`, form)
      setSuccess('User updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const data = err.response?.data
      setError(
        Object.entries(data || {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          .join(' | ') || 'Failed to update user.'
      )
    } finally {
      setSaving(false)
    }
  }

  const roleColors = {
    principal: '#7c3aed', hod: '#d97706',
    teacher: '#0d9488', student: '#2563eb',
  }

  if (loading) return <p style={{padding:'32px', color:'#64748b'}}>Loading...</p>
  if (!user)   return <p style={{padding:'32px', color:'#dc2626'}}>User not found.</p>

  return (
    <div>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>

      {/* User header */}
      <div style={styles.header}>
        <div style={{...styles.avatar, backgroundColor: roleColors[user.role] || '#64748b'}}>
          {(user.first_name || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={styles.heading}>{user.first_name} {user.last_name}</h2>
          <div style={styles.metaRow}>
            <span style={{...styles.roleBadge, backgroundColor: roleColors[user.role] || '#64748b'}}>
              {user.role}
            </span>
            <span style={styles.username}>@{user.username}</span>
          </div>
        </div>
      </div>

      {success && <div style={styles.successMsg}>{success}</div>}
      {error   && <div style={styles.errorMsg}>{error}</div>}

      {/* Editable fields */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Basic Information</div>
        <div style={styles.grid2}>
          <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
          <Field label="Last Name"  name="last_name"  value={form.last_name}  onChange={handleChange} />
          <Field label="Email"      name="email"      value={form.email}      onChange={handleChange} type="email" />
          <Field label="Phone"      name="phone"      value={form.phone}      onChange={handleChange} placeholder="10 digits" />
        </div>

        {/* Active toggle */}
        <div style={styles.toggleRow}>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              style={{marginRight:'8px', width:'16px', height:'16px'}}
            />
            Account is Active
          </label>
          <span style={{fontSize:'13px', color: form.is_active ? '#16a34a' : '#dc2626'}}>
            {form.is_active ? 'User can log in' : 'User is blocked from logging in'}
          </span>
        </div>
      </div>

      {/* Read-only profile info */}
      {profile && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            {user.role === 'student' ? 'Student Profile' : 'Teacher Profile'}
            <span style={styles.readOnlyNote}> — read only</span>
          </div>
          <div style={styles.infoGrid}>
            {user.role === 'student' && (
              <>
                <InfoRow label="Roll Number" value={profile.roll_number} />
                <InfoRow label="Department"  value={profile.department_name} />
                <InfoRow label="Semester"    value={`Semester ${profile.semester}`} />
                <InfoRow label="Batch Year"  value={profile.batch_year} />
              </>
            )}
            {['teacher', 'hod'].includes(user.role) && (
              <>
                <InfoRow label="Employee ID"    value={profile.employee_id} />
                <InfoRow label="Department"     value={profile.department_name || profile.department} />
                <InfoRow label="Specialization" value={profile.specialization || '—'} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Save / Cancel */}
      <div style={styles.btnRow}>
        <button onClick={() => navigate(-1)} style={styles.cancelBtn}>Cancel</button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{...styles.saveBtn, opacity: saving ? 0.7 : 1}}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value || '—'}</span>
    </div>
  )
}

const styles = {
  backBtn:      { background:'none', border:'1px solid #e2e8f0', borderRadius:'6px',
                  padding:'6px 14px', cursor:'pointer', color:'#64748b',
                  fontSize:'14px', marginBottom:'20px' },
  header:       { display:'flex', alignItems:'center', gap:'16px',
                  backgroundColor:'#fff', padding:'20px 24px', borderRadius:'12px',
                  border:'1px solid #e2e8f0', marginBottom:'16px' },
  avatar:       { width:'52px', height:'52px', borderRadius:'50%', display:'flex',
                  alignItems:'center', justifyContent:'center', color:'#fff',
                  fontSize:'22px', fontWeight:'700', flexShrink:0 },
  heading:      { fontSize:'20px', fontWeight:'600', color:'#0f172a', margin:'0 0 6px 0' },
  metaRow:      { display:'flex', alignItems:'center', gap:'10px' },
  roleBadge:    { color:'#fff', padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
  username:     { fontSize:'13px', color:'#94a3b8' },
  successMsg:   { backgroundColor:'#dcfce7', color:'#16a34a', padding:'10px 16px',
                  borderRadius:'8px', marginBottom:'16px', fontSize:'14px', border:'1px solid #bbf7d0' },
  errorMsg:     { backgroundColor:'#fef2f2', color:'#dc2626', padding:'10px 16px',
                  borderRadius:'8px', marginBottom:'16px', fontSize:'14px', border:'1px solid #fecaca' },
  section:      { backgroundColor:'#fff', padding:'24px', borderRadius:'12px',
                  border:'1px solid #e2e8f0', marginBottom:'16px' },
  sectionTitle: { fontSize:'13px', fontWeight:'600', color:'#94a3b8', textTransform:'uppercase',
                  letterSpacing:'0.05em', marginBottom:'16px' },
  readOnlyNote: { fontSize:'11px', color:'#cbd5e1', textTransform:'none',
                  letterSpacing:'0', fontWeight:'400' },
  grid2:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'8px' },
  fieldGroup:   { display:'flex', flexDirection:'column', gap:'6px' },
  label:        { fontSize:'14px', fontWeight:'500', color:'#374151' },
  input:        { padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:'6px',
                  fontSize:'14px', outline:'none', width:'100%', boxSizing:'border-box' },
  toggleRow:    { display:'flex', alignItems:'center', gap:'16px', marginTop:'8px',
                  padding:'12px', backgroundColor:'#f8fafc', borderRadius:'8px' },
  toggleLabel:  { display:'flex', alignItems:'center', fontSize:'14px',
                  fontWeight:'500', color:'#374151', cursor:'pointer' },
  infoGrid:     { display:'flex', flexDirection:'column', gap:'0' },
  infoRow:      { display:'flex', padding:'10px 0', borderBottom:'1px solid #f1f5f9' },
  infoLabel:    { width:'140px', color:'#64748b', fontSize:'14px' },
  infoValue:    { color:'#0f172a', fontSize:'14px', fontWeight:'500' },
  btnRow:       { display:'flex', gap:'12px', justifyContent:'flex-end' },
  cancelBtn:    { padding:'10px 24px', backgroundColor:'#f1f5f9', color:'#374151',
                  border:'1px solid #e2e8f0', borderRadius:'6px', cursor:'pointer',
                  fontWeight:'500', fontSize:'14px' },
  saveBtn:      { padding:'10px 28px', backgroundColor:'#4f46e5', color:'#fff',
                  border:'none', borderRadius:'6px', cursor:'pointer',
                  fontWeight:'500', fontSize:'14px' },
}