// src/pages/student/Profile.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'

export default function StudentProfile() {
  const { user }                  = useAuth()
  const [profile,   setProfile]   = useState(null)
  const [editing,   setEditing]   = useState(false)
  const [phone,     setPhone]     = useState('')
  const [createdAt, setCreatedAt] = useState('')   // ← added
  const [loading,   setLoading]   = useState(true)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    Promise.all([
      API.get('/students/my-profile/'),
      API.get('/auth/whoami/'),
    ])
      .then(([profileRes, whoamiRes]) => {
        setProfile(profileRes.data)
        setPhone(whoamiRes.data.phone || '')
        setCreatedAt(whoamiRes.data.created_at || '')  // ← added
      })
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setError('')
    try {
      await API.patch('/auth/users/update-me/', { phone })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.')
    }
  }

  if (loading) return <p style={{ padding: '32px' }}>Loading...</p>

  return (
    <div>
      <h2 style={styles.heading}>My Profile</h2>

      {error && <div style={styles.errorMsg}>{error}</div>}
      {saved && <div style={styles.successMsg}>Profile updated successfully!</div>}

      <div style={styles.card}>
        {/* Avatar */}
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={styles.name}>{user?.full_name}</div>
            <div style={styles.roleTag}>Student</div>
          </div>
        </div>

        {/* Info rows */}
        <div style={styles.infoGrid}>
          <InfoRow label="Email"        value={user?.email} />
          <InfoRow label="Roll Number"  value={profile?.roll_number} />
          <InfoRow label="Department"   value={profile?.department_name} />
          <InfoRow label="Semester"     value={`Semester ${profile?.semester}`} />
          <InfoRow label="Batch Year"   value={profile?.batch_year} />
          <InfoRow label="Member Since" value={createdAt} />  {/* ← added */}

          {/* Editable phone */}
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Phone</span>
            {editing ? (
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={styles.input}
                placeholder="Enter phone number"
              />
            ) : (
              <span style={styles.infoValue}>{phone || 'Not set'}</span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.btnRow}>
          {editing ? (
            <>
              <button onClick={handleSave}              style={styles.saveBtn}>Save</button>
              <button onClick={() => setEditing(false)} style={styles.cancelBtn}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={styles.editBtn}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ width: '140px', color: '#64748b', fontSize: '14px' }}>{label}</span>
      <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>{value || '—'}</span>
    </div>
  )
}

const styles = {
  heading:       { fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '24px' },
  successMsg:    { backgroundColor: '#dcfce7', color: '#16a34a', padding: '10px 14px',
                   borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  errorMsg:      { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px',
                   borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  card:          { backgroundColor: '#fff', padding: '28px', borderRadius: '10px',
                   border: '1px solid #e2e8f0', maxWidth: '560px' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '16px',
                   marginBottom: '24px', paddingBottom: '20px',
                   borderBottom: '1px solid #f1f5f9' },
  avatar:        { width: '60px', height: '60px', borderRadius: '50%',
                   backgroundColor: '#2563eb', display: 'flex', alignItems: 'center',
                   justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: '600' },
  name:          { fontSize: '18px', fontWeight: '600', color: '#0f172a' },
  roleTag:       { fontSize: '13px', color: '#2563eb', fontWeight: '500', marginTop: '2px' },
  infoGrid:      { marginBottom: '20px' },
  infoRow:       { display: 'flex', alignItems: 'center', padding: '10px 0',
                   borderBottom: '1px solid #f1f5f9' },
  infoLabel:     { width: '140px', color: '#64748b', fontSize: '14px' },
  infoValue:     { color: '#0f172a', fontSize: '14px', fontWeight: '500' },
  input:         { flex: 1, padding: '6px 10px', border: '1px solid #d1d5db',
                   borderRadius: '6px', fontSize: '14px' },
  btnRow:        { display: 'flex', gap: '10px' },
  editBtn:       { padding: '8px 20px', backgroundColor: '#2563eb', color: '#fff',
                   border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  saveBtn:       { padding: '8px 20px', backgroundColor: '#16a34a', color: '#fff',
                   border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  cancelBtn:     { padding: '8px 20px', backgroundColor: '#f1f5f9', color: '#374151',
                   border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' },
}