// src/pages/principal/AddUser.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import API from '../../api/axios'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import toast from 'react-hot-toast'

const INITIAL_FORM = {
  first_name: '', last_name: '', email: '', username: '',
  password: '', role: 'student', phone: '',
  employee_id: '', specialization: '', department: '',
  roll_number: '', semester: '1', batch_year: new Date().getFullYear().toString(),
}

const ROLE_META = {
  principal: { color: '#7c3aed', label: 'Principal' },
  hod:       { color: '#d97706', label: 'HOD'       },
  teacher:   { color: '#0d9488', label: 'Teacher'   },
  student:   { color: '#2563eb', label: 'Student'   },
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

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!form.first_name.trim()) err.first_name = 'Required'
    if (!form.last_name.trim())  err.last_name  = 'Required'
    if (!form.email.trim())      err.email      = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Invalid email'
    if (!form.username.trim())   err.username   = 'Required'
    if (!form.password.trim())   err.password   = 'Required'
    else if (form.password.length < 8) err.password = 'Min 8 characters'
    if (!form.phone.trim())      err.phone      = 'Required'
    else if (!/^\d{10}$/.test(form.phone)) err.phone = 'Must be 10 digits'
    if (['teacher', 'hod'].includes(form.role)) {
      if (!form.employee_id.trim()) err.employee_id = 'Required'
      if (!form.department)         err.department  = 'Required'
    }
    if (form.role === 'student') {
      if (!form.roll_number.trim()) err.roll_number = 'Required'
      if (!form.department)         err.department  = 'Required'
    }
    return err
  }

  const extractError = data => {
    if (!data) return 'Unknown error'
    if (typeof data === 'string') return data
    if (data.detail) return data.detail
    return Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(' | ')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setApiError('')
    setErrors({})
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setSaving(true)
    let newUser = null
    try {
      const userRes = await API.post('/auth/users/', {
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, username: form.username,
        password: form.password, role: form.role, phone: form.phone,
      })
      newUser = userRes.data
      if (['teacher', 'hod'].includes(form.role)) {
        await API.post('/teachers/', {
          user: newUser.id, department: parseInt(form.department),
          employee_id: form.employee_id, specialization: form.specialization,
        })
        if (form.role === 'hod') {
          await API.patch(`/departments/${form.department}/`, { hod: newUser.id })
        }
      }
      if (form.role === 'student') {
        await API.post('/students/', {
          user: newUser.id, department: parseInt(form.department),
          roll_number: form.roll_number, semester: parseInt(form.semester),
          batch_year: parseInt(form.batch_year),
        })
      }
      navigate('/principal/users', { state: { success: `${form.first_name} ${form.last_name} added successfully!` } })
    } catch (err) {
      const data = err.response?.data
      if (newUser) {
        try { await API.delete(`/auth/users/${newUser.id}/`) } catch {}
        setApiError(`Profile creation failed. Error: ${extractError(data)}`)
      } else {
        if (data?.email)    setErrors(p => ({ ...p, email: data.email[0] }))
        if (data?.username) setErrors(p => ({ ...p, username: data.username[0] }))
        setApiError(`User creation failed: ${extractError(data)}`)
      }
    } finally { setSaving(false) }
  }

  const isTeacherOrHOD = ['teacher', 'hod'].includes(form.role)
  const isStudent      = form.role === 'student'

  return (
    <div>
      <motion.button onClick={() => navigate(-1)} whileHover={{ x: -2 }}
        className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200
          rounded-lg px-3 py-1.5 mb-6 bg-white hover:bg-gray-50 transition-colors">
        <ArrowLeft size={14} /> Back
      </motion.button>

      <PageHeader title="Add New User" subtitle="Fill in all required fields based on the role" />

      {apiError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 mb-5 text-sm">
          <strong>Error:</strong> {apiError}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">

        {/* Basic info */}
        <Section title="Basic Information" delay={0.05}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name *" name="first_name" value={form.first_name} onChange={handleChange} error={errors.first_name} placeholder="e.g. Rahul" />
            <Field label="Last Name *"  name="last_name"  value={form.last_name}  onChange={handleChange} error={errors.last_name}  placeholder="e.g. Kumar" />
            <Field label="Email *"      name="email"      value={form.email}      onChange={handleChange} error={errors.email}      type="email" placeholder="rahul@sms.com" />
            <Field label="Phone *"      name="phone"      value={form.phone}      onChange={handleChange} error={errors.phone}      placeholder="10 digit number" />
          </div>
        </Section>

        {/* Account details */}
        <Section title="Account Details" delay={0.1}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Username *" name="username" value={form.username} onChange={handleChange} error={errors.username} placeholder="e.g. rahul_kumar" />
            <Field label="Password *" name="password" value={form.password} onChange={handleChange} error={errors.password} type="password" placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Role *</label>
            <div className="flex gap-2.5 flex-wrap">
              {['student', 'teacher', 'hod', 'principal'].map(role => {
                const m = ROLE_META[role]
                const active = form.role === role
                return (
                  <motion.button key={role} type="button"
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setForm(p => ({ ...p, role })); setErrors({}); setApiError('') }}
                    className="px-5 py-2 rounded-lg border text-sm font-medium transition-colors"
                    style={active
                      ? { backgroundColor: m.color, color: '#fff', borderColor: m.color }
                      : { backgroundColor: 'var(--hover-row)', color: '#64748b', borderColor: '#e2e8f0' }}>
                    {m.label}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </Section>

        {/* Teacher/HOD profile */}
        <AnimatePresence>
          {isTeacherOrHOD && (
            <motion.div key="teacher-section"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
              <Section title={`${form.role === 'hod' ? 'HOD' : 'Teacher'} Profile`} delay={0}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="Employee ID *"  name="employee_id"    value={form.employee_id}    onChange={handleChange} error={errors.employee_id}    placeholder="e.g. CS_T006" />
                  <Field label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Data Science" />
                </div>
                <SelectField label="Department *" name="department" value={form.department}
                  onChange={handleChange} error={errors.department}>
                  <option value="">-- Select Department --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </SelectField>
                {form.role === 'hod' && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    This person will be assigned as HOD of the selected department.
                    The existing HOD will be replaced.
                  </div>
                )}
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Student profile */}
        <AnimatePresence>
          {isStudent && (
            <motion.div key="student-section"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
              <Section title="Student Profile" delay={0}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="Roll Number *" name="roll_number" value={form.roll_number} onChange={handleChange} error={errors.roll_number} placeholder="e.g. CS2024001" />
                  <Field label="Batch Year *"  name="batch_year"  value={form.batch_year}  onChange={handleChange} error={errors.batch_year}  type="number" placeholder="e.g. 2024" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField label="Semester *" name="semester" value={form.semester}
                    onChange={handleChange} error={errors.semester}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </SelectField>
                  <SelectField label="Department *" name="department" value={form.department}
                    onChange={handleChange} error={errors.department}>
                    <option value="">-- Select Department --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </SelectField>
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <div className="flex gap-3 justify-end pt-1">
          <Button variant="outline" color="#64748b" onClick={() => navigate(-1)} type="button">Cancel</Button>
          <Button type="submit" disabled={saving} color="#4f46e5">
            {saving ? 'Creating...' : `Create ${ROLE_META[form.role]?.label}`}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-gray-100 p-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">{title}</p>
      {children}
    </motion.div>
  )
}

function Field({ label, name, value, onChange, error, placeholder, type = 'text' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`px-3 py-2 border rounded-lg text-sm outline-none transition-all
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

function SelectField({ label, name, value, onChange, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select name={name} value={value} onChange={onChange}
        className={`px-3 py-2 border rounded-lg text-sm outline-none transition-all
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}