// src/pages/principal/EditUser.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const ROLE_META = {
  principal: { color: '#7c3aed', bg: '#f5f3ff' },
  hod:       { color: '#d97706', bg: '#fef3c7' },
  teacher:   { color: '#0d9488', bg: '#ccfbf1' },
  student:   { color: '#2563eb', bg: '#dbeafe' },
}

export default function EditUser() {
  const { id }  = useParams()
  const navigate = useNavigate()
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [form,    setForm]    = useState({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    Promise.all([API.get(`/auth/users/${id}/`), API.get('/departments/')])
      .then(async ([userRes]) => {
        const u = userRes.data
        setUser(u)
        setForm({
          first_name: u.first_name || '',
          last_name:  u.last_name  || '',
          email:      u.email      || '',
          phone:      u.phone      || '',
          is_active:  u.is_active,
        })
        try {
          if (u.role === 'student') {
            const res = await API.get('/students/')
            setProfile(res.data.find(s => s.user === parseInt(id)) || null)
          } else if (['teacher', 'hod'].includes(u.role)) {
            const res = await API.get('/teachers/')
            setProfile(res.data.find(t => t.user === parseInt(id)) || null)
          }
        } catch { setProfile(null) }
      }).finally(() => setLoading(false))
  }, [id])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await API.patch(`/auth/users/${id}/`, form)
      toast.success('User updated successfully!')
    } catch (err) {
      const data = err.response?.data
      toast.error(
        Object.entries(data || {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          .join(' | ') || 'Failed to update user.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading...</div>
  if (!user)   return <div className="p-8 text-sm text-red-500">User not found.</div>

  const meta = ROLE_META[user.role] || { color: '#64748b', bg: '#f1f5f9' }

  return (
    <div className="max-w-2xl">
      <motion.button onClick={() => navigate(-1)} whileHover={{ x: -2 }}
        className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200
          rounded-lg px-3 py-1.5 mb-6 bg-white hover:bg-gray-50 transition-colors">
        <ArrowLeft size={14} /> Back
      </motion.button>

      {/* User header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 p-5 mb-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0"
          style={{ backgroundColor: meta.color }}>
          {(user.first_name || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{user.first_name} {user.last_name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge label={user.role} color={meta.color} bg={meta.bg} />
            <span className="text-xs text-gray-400">@{user.username}</span>
          </div>
        </div>
      </motion.div>

      {/* Basic info section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
          Basic Information
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
          <Field label="Last Name"  name="last_name"  value={form.last_name}  onChange={handleChange} />
          <Field label="Email"      name="email"      value={form.email}      onChange={handleChange} type="email" />
          <Field label="Phone"      name="phone"      value={form.phone}      onChange={handleChange} placeholder="10 digits" />
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-gray-700">
            <input type="checkbox" name="is_active" checked={form.is_active}
              onChange={handleChange} className="w-4 h-4 accent-indigo-600" />
            Account is Active
          </label>
          <span className="text-xs font-medium" style={{ color: form.is_active ? '#16a34a' : '#dc2626' }}>
            {form.is_active ? 'User can log in' : 'User is blocked from logging in'}
          </span>
        </div>
      </motion.div>

      {/* Read-only profile */}
      {profile && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {user.role === 'student' ? 'Student Profile' : 'Teacher Profile'}
            <span className="text-gray-300 normal-case font-normal tracking-normal ml-2">— read only</span>
          </p>
          <div className="divide-y divide-gray-50">
            {(user.role === 'student' ? [
              { label: 'Roll Number', value: profile.roll_number },
              { label: 'Department',  value: profile.department_name },
              { label: 'Semester',    value: `Semester ${profile.semester}` },
              { label: 'Batch Year',  value: profile.batch_year },
            ] : [
              { label: 'Employee ID',    value: profile.employee_id },
              { label: 'Department',     value: profile.department_name || profile.department },
              { label: 'Specialization', value: profile.specialization || '—' },
            ]).map(({ label, value }) => (
              <div key={label} className="flex py-2.5">
                <span className="w-36 text-sm text-gray-400 shrink-0">{label}</span>
                <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" color="#64748b" onClick={() => navigate(-1)}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving} color="#4f46e5">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
    </div>
  )
}