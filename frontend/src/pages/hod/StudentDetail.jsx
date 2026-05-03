// src/pages/hod/StudentDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'
import { SkeletonTable } from '../../components/ui/Skeleton'

const TABS = ['profile', 'subjects', 'attendance', 'marks']

export default function StudentDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [student,     setStudent]     = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [attendance,  setAttendance]  = useState([])
  const [grades,      setGrades]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [activeTab,   setActiveTab]   = useState('profile')

  useEffect(() => {
    Promise.all([
      API.get(`/students/${id}/`),
      API.get('/enrollments/'),
      API.get('/attendance/'),
      API.get('/grades/'),
    ]).then(([stuRes, enrRes, attRes, grRes]) => {
      const sp     = stuRes.data
      setStudent(sp)
      const enr    = enrRes.data.filter(e => e.student === sp.id)
      const enrIds = enr.map(e => e.id)
      setEnrollments(enr)
      setAttendance(attRes.data.filter(a => enrIds.includes(a.enrollment)))
      setGrades(grRes.data.filter(g => enrIds.includes(g.enrollment)))
    }).catch(() => setError('Could not load student details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="space-y-4"><SkeletonTable rows={6} /></div>
  if (error)   return <p className="p-8 text-red-500">{error}</p>
  if (!student) return <p className="p-8 text-red-500">Student not found.</p>

  const attBySubject = attendance.reduce((acc, a) => {
    if (!acc[a.subject_name]) acc[a.subject_name] = { present: 0, absent: 0, total: 0 }
    if (a.status === 'present') acc[a.subject_name].present++
    else acc[a.subject_name].absent++
    acc[a.subject_name].total++
    return acc
  }, {})

  const gradeBySubject = grades.reduce((acc, g) => {
    if (!acc[g.subject_name]) acc[g.subject_name] = {}
    acc[g.subject_name][g.exam_type] = g
    return acc
  }, {})

  return (
    <div>
      <motion.button onClick={() => navigate(-1)} whileHover={{ x: -2 }}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
          border border-gray-200 dark:border-gray-700
          rounded-lg px-3 py-1.5 mb-6
          bg-white dark:bg-gray-800
          hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <ArrowLeft size={14} /> Back
      </motion.button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800
          p-6 mb-5 flex items-center gap-5">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center
            text-white text-2xl font-bold shrink-0">
          {student.full_name?.charAt(0).toUpperCase()}
        </motion.div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{student.full_name}</h2>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge label="Student" color="#2563eb" bg="#dbeafe" />
            <span className="text-sm text-gray-400">{student.email}</span>
            <span className="text-sm text-gray-400">Roll: {student.roll_number}</span>
            <span className="text-sm text-gray-400">Sem {student.semester}</span>
            <span className="text-sm text-gray-400">Batch {student.batch_year}</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <motion.button key={tab} onClick={() => setActiveTab(tab)} whileTap={{ scale: 0.97 }}
            className="px-5 py-2 rounded-md text-sm font-medium transition-colors capitalize"
            style={activeTab === tab
              ? { backgroundColor: '#fff', color: '#0f172a', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { backgroundColor: 'transparent', color: '#64748b' }}>
            {tab}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

          {/* ── Profile tab ── */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Student Profile
              </p>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {[
                  { label: 'Full Name',   value: student.full_name },
                  { label: 'Email',       value: student.email },
                  { label: 'Roll Number', value: student.roll_number },
                  { label: 'Department',  value: student.department_name },
                  { label: 'Semester',    value: `Semester ${student.semester}` },
                  { label: 'Batch Year',  value: student.batch_year },
                ].map(({ label, value }) => (
                  <div key={label} className="flex py-3">
                    <span className="w-40 text-sm text-gray-400 shrink-0">{label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Subjects tab ── */}
          {activeTab === 'subjects' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Enrolled Subjects ({enrollments.length})
                </p>
              </div>
              {enrollments.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/60 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                      {['#', 'Subject', 'Enrolled On'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((en, idx) => (
                      <motion.tr key={en.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b border-gray-50 dark:border-gray-800
                          transition-colors duration-150
                          hover:bg-slate-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-3 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200">{en.class_name}</td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                          {new Date(en.enrolled_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-sm text-gray-400">No subjects enrolled.</div>
              )}
            </div>
          )}

          {/* ── Attendance tab ──
              FIX: removed style={{ backgroundColor: bg }} which used hardcoded light colors.
              Now uses Tailwind dark-aware classes for the card background per attendance level. */}
          {activeTab === 'attendance' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
                Attendance Summary
              </p>
              {Object.entries(attBySubject).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(attBySubject).map(([subj, data], idx) => {
                    const pct = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
                    const col = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'
                    // Dark-aware card bg via Tailwind instead of inline style
                    const cardClass = pct >= 75
                      ? 'bg-green-50 dark:bg-green-950/40'
                      : pct >= 50
                      ? 'bg-amber-50 dark:bg-amber-950/40'
                      : 'bg-red-50 dark:bg-red-950/40'
                    const trackClass = pct >= 75
                      ? 'bg-green-100 dark:bg-green-900/50'
                      : pct >= 50
                      ? 'bg-amber-100 dark:bg-amber-900/50'
                      : 'bg-red-100 dark:bg-red-900/50'
                    return (
                      <motion.div key={subj}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className={`rounded-xl p-4 ${cardClass}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{subj}</span>
                          <span className="text-lg font-bold" style={{ color: col }}>{pct}%</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden mb-2 ${trackClass}`}>
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: col }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: idx * 0.08, ease: 'easeOut' }} />
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span style={{ color: '#16a34a' }} className="font-medium">Present: {data.present}</span>
                          <span style={{ color: '#dc2626' }} className="font-medium">Absent: {data.absent}</span>
                          <span className="text-gray-400 dark:text-gray-500">Total: {data.total}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-gray-400">No attendance records found.</div>
              )}
            </div>
          )}

          {/* ── Marks tab ── */}
          {activeTab === 'marks' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Marks</p>
              </div>
              {Object.entries(gradeBySubject).length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/60 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                      {['Subject', 'Internal 1', 'Internal 2', 'Assignment', 'Final', 'Overall %'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gradeBySubject).map(([subj, examMap], idx) => {
                      const all     = Object.values(examMap)
                      const totM    = all.reduce((s, g) => s + parseFloat(g.marks    || 0), 0)
                      const totMax  = all.reduce((s, g) => s + parseFloat(g.max_marks || 0), 0)
                      const overall = totMax > 0 ? Math.round((totM / totMax) * 100) : null
                      const col     = overall != null
                        ? overall >= 75 ? '#16a34a' : overall >= 50 ? '#d97706' : '#dc2626'
                        : '#94a3b8'
                      const fmt = key => examMap[key]
                        ? <span className="text-gray-800 dark:text-gray-200">{examMap[key].marks}<span className="text-gray-300 dark:text-gray-600">/{examMap[key].max_marks}</span></span>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      return (
                        <motion.tr key={subj}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b border-gray-50 dark:border-gray-800
                            transition-colors duration-150
                            hover:bg-slate-50 dark:hover:bg-gray-800">
                          <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{subj}</td>
                          <td className="px-5 py-3">{fmt('internal1')}</td>
                          <td className="px-5 py-3">{fmt('internal2')}</td>
                          <td className="px-5 py-3">{fmt('assignment')}</td>
                          <td className="px-5 py-3">{fmt('final')}</td>
                          <td className="px-5 py-3">
                            {overall != null
                              ? <span className="font-semibold" style={{ color: col }}>{overall}%</span>
                              : <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-sm text-gray-400">No marks recorded yet.</div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}