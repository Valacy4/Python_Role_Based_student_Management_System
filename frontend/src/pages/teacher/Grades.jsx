// src/pages/teacher/Grades.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import API from '../../api/axios'
import { validateGrade } from '../../utils/validate'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { SkeletonTable } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const EXAM_TYPES = [
  { value: 'internal1',  label: 'Internal 1' },
  { value: 'internal2',  label: 'Internal 2' },
  { value: 'assignment', label: 'Assignment'  },
  { value: 'final',      label: 'Final Exam'  },
]

const ACCENT = '#0d9488'

export default function TeacherGrades() {
  const [classes,     setClasses]     = useState([])
  const [selectedCls, setSelectedCls] = useState(null)   // now stores full class object
  const [enrollments, setEnrollments] = useState([])
  const [grades,      setGrades]      = useState([])
  const [form,        setForm]        = useState({
    enrollment: '', exam_type: 'internal1', marks: '', max_marks: '50', remarks: ''
  })
  const [formErrors, setFormErrors]   = useState({})
  const [saving,     setSaving]       = useState(false)
  const [loading,    setLoading]      = useState(false)

  useEffect(() => {
    API.get('/classes/my-classes/').then(res => setClasses(res.data))
    API.get('/grades/').then(res => setGrades(res.data))
  }, [])

  useEffect(() => {
    if (!selectedCls) return
    setLoading(true)
    API.get('/enrollments/').then(res => {
      setEnrollments(res.data.filter(e => e.cls === selectedCls.id))
    }).finally(() => setLoading(false))
  }, [selectedCls])

  const handleSubmit = async e => {
    e.preventDefault()
    const errors = validateGrade(form)
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setFormErrors({})
    setSaving(true)
    try {
      const res = await API.post('/grades/', form)
      setGrades(prev => [res.data, ...prev])
      setForm({ enrollment: '', exam_type: 'internal1', marks: '', max_marks: '50', remarks: '' })
      toast.success('Grade saved successfully!')
    } catch (err) {
      toast.error(
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Failed to save grade.'
      )
    } finally { setSaving(false) }
  }

  const classGrades = grades.filter(g => enrollments.some(e => e.id === g.enrollment))

  const fmt = g => g
    ? <span className="text-gray-700 dark:text-gray-300">{g.marks}<span className="text-gray-300 dark:text-gray-600">/{g.max_marks}</span></span>
    : <span className="text-gray-300 dark:text-gray-600">—</span>

  // parse subject code and name from "CS302 - Database Management"
  const parseSubject = (name = '') => {
    const parts = name.split(' - ')
    return parts.length >= 2
      ? { code: parts[0].trim(), name: parts.slice(1).join(' - ').trim() }
      : { code: null, name }
  }

  return (
    <div>
      <PageHeader title="Manage Grades" subtitle="Add and view grades for your classes" />

      <AnimatePresence mode="wait">

        {/* ── Class picker grid ── */}
        {!selectedCls && (
          <motion.div key="picker"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {classes.length === 0 ? (
              <p className="text-sm text-gray-400 py-12 text-center">No classes assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls, idx) => {
                  const { code, name } = parseSubject(cls.subject_name)
                  return (
                    <motion.div key={cls.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                      onClick={() => setSelectedCls(cls)}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800
                        p-5 cursor-pointer transition-shadow relative overflow-hidden group">

                      {/* Colored top bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                        style={{ backgroundColor: ACCENT }} />

                      <div className="mt-1">
                        {code && (
                          <p className="text-xs font-bold mb-1" style={{ color: ACCENT }}>{code}</p>
                        )}
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {name}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                          {cls.academic_year}
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Active badge */}
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                            ${cls.is_active
                              ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                            {cls.is_active ? 'Active' : 'Inactive'}
                          </span>

                          <span className="text-xs font-medium transition-colors"
                            style={{ color: ACCENT }}>
                            Manage grades →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Selected class view ── */}
        {selectedCls && (
          <motion.div key="content"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="space-y-5">

            {/* Back + class info bar */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setSelectedCls(null); setEnrollments([]) }}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
                  border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5
                  bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <ArrowLeft size={14} /> Back
              </motion.button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: '#ccfbf1', color: ACCENT }}>
                  {parseSubject(selectedCls.subject_name).code || selectedCls.subject_name}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {parseSubject(selectedCls.subject_name).name}
                </span>
                <span className="text-xs text-gray-400">{selectedCls.academic_year}</span>
              </div>
            </div>

            {/* Add grade form */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-5">Add Grade</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                  {/* Student */}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student</label>
                    <select value={form.enrollment}
                      onChange={e => { setForm({ ...form, enrollment: e.target.value }); setFormErrors(p => ({ ...p, enrollment: '' })) }}
                      className={`px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500
                        bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                        ${formErrors.enrollment
                          ? 'border-red-400'
                          : 'border-gray-200 dark:border-gray-700'}`}>
                      <option value="">-- Select student --</option>
                      {enrollments.map(e => (
                        <option key={e.id} value={e.id}>{e.student_name} ({e.roll_number})</option>
                      ))}
                    </select>
                    {formErrors.enrollment && <span className="text-xs text-red-500">{formErrors.enrollment}</span>}
                  </div>

                  {/* Exam type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Exam Type</label>
                    <select value={form.exam_type}
                      onChange={e => setForm({ ...form, exam_type: e.target.value })}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm
                        outline-none focus:ring-2 focus:ring-indigo-500
                        bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                      {EXAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  {/* Marks */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Marks / Max</label>
                    <div className="flex gap-2">
                      <input type="number" value={form.marks}
                        onChange={e => { setForm({ ...form, marks: e.target.value }); setFormErrors(p => ({ ...p, marks: '' })) }}
                        placeholder="0"
                        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500
                          bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                          ${formErrors.marks ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`} />
                      <input type="number" value={form.max_marks}
                        onChange={e => { setForm({ ...form, max_marks: e.target.value }); setFormErrors(p => ({ ...p, max_marks: '' })) }}
                        placeholder="50"
                        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500
                          bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                          ${formErrors.max_marks ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`} />
                    </div>
                    {(formErrors.marks || formErrors.max_marks) && (
                      <span className="text-xs text-red-500">{formErrors.marks || formErrors.max_marks}</span>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Remarks</label>
                  <input value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })}
                    placeholder="Optional remarks"
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm
                      outline-none focus:ring-2 focus:ring-indigo-500
                      bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 max-w-sm" />
                </div>

                <Button type="submit" disabled={saving} color="#4f46e5">
                  {saving ? 'Saving...' : 'Save Grade'}
                </Button>
              </form>
            </div>

            {/* Grades table */}
            {loading ? <SkeletonTable rows={4} /> : classGrades.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Grade Summary</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/60 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                      {['Student', 'Roll No', 'Internal 1', 'Internal 2', 'Assignment', 'Final', 'Overall %'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((en, idx) => {
                      const enGrades   = classGrades.filter(g => g.enrollment === en.id)
                      if (enGrades.length === 0) return null
                      const internal1  = enGrades.find(g => g.exam_type === 'internal1')
                      const internal2  = enGrades.find(g => g.exam_type === 'internal2')
                      const assignment = enGrades.find(g => g.exam_type === 'assignment')
                      const final      = enGrades.find(g => g.exam_type === 'final')
                      const totalM     = enGrades.reduce((s, g) => s + parseFloat(g.marks    || 0), 0)
                      const totalMax   = enGrades.reduce((s, g) => s + parseFloat(g.max_marks || 0), 0)
                      const overall    = totalMax > 0 ? Math.round((totalM / totalMax) * 100) : null
                      const col        = overall != null
                        ? overall >= 75 ? '#16a34a' : overall >= 50 ? '#d97706' : '#dc2626'
                        : '#94a3b8'
                      return (
                        <motion.tr key={en.id}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="border-b border-gray-50 dark:border-gray-800
                            transition-colors duration-150
                            hover:bg-slate-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{en.student_name}</td>
                          <td className="px-4 py-3">
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300
                              px-2 py-0.5 rounded text-xs font-medium">
                              {en.roll_number}
                            </span>
                          </td>
                          <td className="px-4 py-3">{fmt(internal1)}</td>
                          <td className="px-4 py-3">{fmt(internal2)}</td>
                          <td className="px-4 py-3">{fmt(assignment)}</td>
                          <td className="px-4 py-3">{fmt(final)}</td>
                          <td className="px-4 py-3">
                            {overall != null
                              ? <span className="font-semibold" style={{ color: col }}>{overall}%</span>
                              : <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}