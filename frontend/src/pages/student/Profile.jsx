// src/pages/student/Profile.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, X, Check, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function StudentProfile() {
  const { user }                  = useAuth()
  const [profile,   setProfile]   = useState(null)
  const [editing,   setEditing]   = useState(false)
  const [phone,     setPhone]     = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    Promise.all([
      API.get('/students/my-profile/'),
      API.get('/auth/whoami/'),
    ]).then(([profileRes, whoamiRes]) => {
      setProfile(profileRes.data)
      setPhone(whoamiRes.data.phone || '')
      setCreatedAt(whoamiRes.data.created_at || '')
    }).catch(() => toast.error('Could not load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await API.patch('/auth/users/update-me/', { phone })
      toast.success('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600" />
    </div>
  )

  const infoRows = [
    { label: 'Email',        value: user?.email },
    { label: 'Roll Number',  value: profile?.roll_number },
    { label: 'Department',   value: profile?.department_name },
    { label: 'Semester',     value: `Semester ${profile?.semester}` },
    { label: 'Batch Year',   value: profile?.batch_year },
    { label: 'Member Since', value: createdAt
        ? new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : null },
  ]

  return (
    <div>
      <PageHeader title="My Profile" subtitle="View and manage your account details" />

      <div className="max-w-xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

          {/* Avatar section */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 px-7 py-8">
            <div className="flex items-center gap-5">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center
                  justify-center text-white text-2xl font-bold shrink-0">
                {user?.full_name?.charAt(0).toUpperCase()}
              </motion.div>
              <div>
                <h2 className="text-xl font-semibold text-white">{user?.full_name}</h2>
                <span className="inline-block mt-1 px-3 py-0.5 bg-white/20 rounded-full
                  text-xs text-white font-medium">
                  Student
                </span>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="px-7 py-5">
            <div className="divide-y divide-gray-50 mb-6">
              {infoRows.map(({ label, value }) => (
                <motion.div key={label}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: infoRows.indexOf({ label, value }) * 0.04 }}
                  className="flex py-3">
                  <span className="w-36 text-sm text-gray-400 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
                </motion.div>
              ))}

              {/* Editable phone row */}
              <div className="flex items-center py-3">
                <span className="w-36 text-sm text-gray-400 shrink-0">Phone</span>
                <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.input key="input"
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      autoFocus
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="flex-1 px-3 py-1.5 border border-blue-300 rounded-lg text-sm
                        outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  ) : (
                    <motion.span key="value"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-sm font-medium text-gray-900">
                      {phone || 'Not set'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div key="editing-btns"
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex gap-2.5">
                    <Button onClick={handleSave} disabled={saving} color="#16a34a">
                      <Check size={14} /> {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={() => setEditing(false)} variant="outline" color="#64748b">
                      <X size={14} /> Cancel
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="edit-btn"
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}>
                    <Button onClick={() => setEditing(true)} color="#2563eb">
                      <Pencil size={14} /> Edit Profile
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}