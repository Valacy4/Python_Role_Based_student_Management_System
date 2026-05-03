// src/pages/teacher/Attendance.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import API from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonTable } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const ACCENT = '#0d9488'

export default function TeacherAttendance() {
  const [classes,     setClasses]     = useState([])
  const [selectedCls, setSelectedCls] = useState(null)  // full class object
  const [enrollments, setEnrollments] = useState([])
  const [date,        setDate]        = useState(new Date().toISOString().split('T')[0])
  const [attendance,  setAttendance]  = useState({})
  const [saving,      setSaving]      = useState(false)
  const [viewTab,     setViewTab]     = useState('mark')
  const [allRecords,  setAllRecords]  = useState([])
  const [filterDate,  setFilterDate]  = useState('')
  const [loading,     setLoading]     = useState(false)

  useEffect(() => {
    API.get('/classes/my-classes/').then(res => setClasses(res.data))
  }, [])

  useEffect(() => {
    if (!selectedCls) return
    setLoading(true)
    API.get('/enrollments/').then(res => {
      const filtered = res.data.filter(e => e.cls === selectedCls.id)
      setEnrollments(filtered)
      const defaults = {}
      filtered.forEach(e => { defaults[e.id] = 'present' })
      setAttendance(defaults)
    }).finally(() => setLoading(false))
  }, [selectedCls])

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
    try {
      await Promise.all(
        enrollments.map(e =>
          API.post('/attendance/', { enrollment: e.id, date, status: attendance[e.id] })
        )
      )
      toast.success('Attendance saved successfully!')
      const enrIds = enrollments.map(e => e.id)
      API.get('/attendance/').then(res => {
        setAllRecords(res.data.filter(a => enrIds.includes(a.enrollment)))
      })
    } catch {
      toast.error('Some records failed — they may already exist for this date.')
    } finally { setSaving(false) }
  }

  const uniqueDates    = [...new Set(allRecords.map(r => r.date))].sort((a, b) => b.localeCompare(a))
  const recordsForDate = filterDate ? allRecords.filter(r => r.date === filterDate) : []

  const attMatrix = enrollments.reduce((acc, en) => {
    acc[en.id] = {}
    allRecords.filter(r => r.enrollment === en.id).forEach(r => { acc[en.id][r.date] = r.status })
    return acc
  }, {})

  const markAll = (status) => {
    const next = {}
    enrollments.forEach(e => { next[e.id] = status })
    setAttendance(next)
  }

  const presentCount = Object.values(attendance).filter(v => v === 'present').length
  const absentCount  = Object.values(attendance).filter(v => v === 'absent').length

  // parse "CS302 - Database Management" → { code, name }
  const parseSubject = (name = '') => {
    const parts = name.split(' - ')
    return parts.length >= 2
      ? { code: parts[0].trim(), name: parts.slice(1).join(' - ').trim() }
      : { code: null, name }
  }

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark or view attendance for your classes" />

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
                      onClick={() => { setSelectedCls(cls); setViewTab('mark') }}
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
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                            ${cls.is_active
                              ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                            {cls.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs font-medium transition-colors"
                            style={{ color: ACCENT }}>
                            Mark attendance →
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
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {/* Back + class info + tab switcher */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <motion.button
                whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setSelectedCls(null); setEnrollments([]); setAllRecords([]) }}
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

              {/* Mark / View tab switcher */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg ml-auto">
                {['mark', 'view'].map(tab => (
                  <motion.button key={tab} onClick={() => setViewTab(tab)} whileTap={{ scale: 0.97 }}
                    className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                    style={viewTab === tab
                      ? { backgroundColor: '#fff', color: '#0f172a', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                      : { backgroundColor: 'transparent', color: '#64748b' }}>
                    {tab === 'mark' ? 'Mark Attendance' : 'View Records'}
                  </motion.button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">

              {/* ── Mark Attendance tab ── */}
              {viewTab === 'mark' && (
                <motion.div key="mark"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

                  <div className="flex flex-wrap items-end gap-4 mb-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700
                          rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500
                          bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" />
                    </div>

                    {enrollments.length > 0 && (
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400">Quick select:</span>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => markAll('present')}
                          className="px-3 py-1.5 text-xs font-medium
                            bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400
                            border border-green-200 dark:border-green-800
                            rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
                          All Present
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => markAll('absent')}
                          className="px-3 py-1.5 text-xs font-medium
                            bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400
                            border border-red-200 dark:border-red-800
                            rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
                          All Absent
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Summary pills */}
                  {enrollments.length > 0 && (
                    <div className="flex gap-3 mb-4">
                      <div className="flex items-center gap-1.5
                        bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800
                        rounded-lg px-3 py-1.5 text-sm text-green-700 dark:text-green-400 font-medium">
                        <CheckCircle size={14} /> {presentCount} Present
                      </div>
                      <div className="flex items-center gap-1.5
                        bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800
                        rounded-lg px-3 py-1.5 text-sm text-red-600 dark:text-red-400 font-medium">
                        <XCircle size={14} /> {absentCount} Absent
                      </div>
                    </div>
                  )}

                  {loading ? <SkeletonTable rows={5} /> : enrollments.length > 0 ? (
                    <>
                      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-5">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50/60 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                              {['Student', 'Roll No', 'Status'].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {enrollments.map((e, idx) => {
                              const status = attendance[e.id]
                              const rowClass = status === 'present'
                                ? 'bg-green-50 dark:bg-green-950/40'
                                : status === 'absent'
                                ? 'bg-red-50 dark:bg-red-950/40'
                                : ''
                              return (
                                <motion.tr key={e.id}
                                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                  className={`border-b border-gray-50 dark:border-gray-800 transition-colors ${rowClass}`}>
                                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{e.student_name}</td>
                                  <td className="px-5 py-3">
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300
                                      px-2 py-0.5 rounded text-xs font-medium">
                                      {e.roll_number}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3">
                                    <div className="flex gap-2">
                                      {['present', 'absent'].map(s => (
                                        <motion.button key={s}
                                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                          onClick={() => setAttendance(prev => ({ ...prev, [e.id]: s }))}
                                          className="px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                                          style={attendance[e.id] === s
                                            ? {
                                                backgroundColor: s === 'present' ? '#16a34a' : '#dc2626',
                                                color: '#fff',
                                                borderColor: s === 'present' ? '#16a34a' : '#dc2626',
                                              }
                                            : {
                                                backgroundColor: 'transparent',
                                                color: '#64748b',
                                                borderColor: '#374151',
                                              }}>
                                          {s === 'present' ? 'Present' : 'Absent'}
                                        </motion.button>
                                      ))}
                                    </div>
                                  </td>
                                </motion.tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      <Button onClick={handleSubmit} disabled={saving} color="#4f46e5">
                        {saving ? 'Saving...' : 'Save Attendance'}
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 py-8 text-center">
                      No students enrolled in this class.
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── View Records tab ── */}
              {viewTab === 'view' && (
                <motion.div key="view"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

                  <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Date</label>
                      <select value={filterDate} onChange={e => setFilterDate(e.target.value)}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700
                          rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500
                          bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-w-[180px]">
                        <option value="">All dates (matrix view)</option>
                        {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Badge label="Present" color="#16a34a" bg="#dcfce7" />
                      <Badge label="Absent"  color="#dc2626" bg="#fee2e2" />
                    </div>
                  </div>

                  {/* Date-filtered view */}
                  {filterDate && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Attendance for {filterDate}</h3>
                        <div className="flex gap-2 text-xs">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {recordsForDate.filter(r => r.status === 'present').length} present
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="text-red-500 dark:text-red-400 font-medium">
                            {recordsForDate.filter(r => r.status === 'absent').length} absent
                          </span>
                        </div>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50/60 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                            {['#', 'Student', 'Roll No', 'Status'].map(h => (
                              <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {enrollments.map((en, idx) => {
                            const record = recordsForDate.find(r => r.enrollment === en.id)
                            const status = record?.status || 'not marked'
                            const col    = status === 'present' ? '#16a34a' : status === 'absent' ? '#dc2626' : '#94a3b8'
                            const bg     = status === 'present' ? '#dcfce7'  : status === 'absent' ? '#fee2e2'  : '#f1f5f9'
                            return (
                              <motion.tr key={en.id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="border-b border-gray-50 dark:border-gray-800
                                  transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-gray-800">
                                <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                                <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{en.student_name}</td>
                                <td className="px-5 py-3">
                                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300
                                    px-2 py-0.5 rounded text-xs font-medium">
                                    {en.roll_number}
                                  </span>
                                </td>
                                <td className="px-5 py-3">
                                  <Badge label={status} color={col} bg={bg} />
                                </td>
                              </motion.tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  {/* Matrix view */}
                  {!filterDate && uniqueDates.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800
                        overflow-hidden overflow-x-auto">
                      <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          All Attendance Records
                          <span className="text-gray-400 font-normal ml-2">— {uniqueDates.length} dates</span>
                        </h3>
                      </div>
                      <table className="text-sm" style={{ minWidth: `${240 + uniqueDates.length * 80}px` }}>
                        <thead>
                          <tr className="bg-gray-50/60 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 min-w-[160px]">Student</th>
                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 min-w-[90px]">Roll No</th>
                            {uniqueDates.map(d => (
                              <th key={d} className="px-2 py-3 text-center text-xs font-medium text-gray-400 min-w-[70px]">
                                {d.slice(5)}
                              </th>
                            ))}
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 min-w-[70px]">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollments.map((en, idx) => {
                            const present = uniqueDates.filter(d => attMatrix[en.id]?.[d] === 'present').length
                            const total   = uniqueDates.filter(d => attMatrix[en.id]?.[d]).length
                            const pct     = total > 0 ? Math.round((present / total) * 100) : 0
                            const pctCol  = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'
                            return (
                              <motion.tr key={en.id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="border-b border-gray-50 dark:border-gray-800
                                  transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-gray-800">
                                <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{en.student_name}</td>
                                <td className="px-5 py-3">
                                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300
                                    px-2 py-0.5 rounded text-xs font-medium">
                                    {en.roll_number}
                                  </span>
                                </td>
                                {uniqueDates.map(d => {
                                  const s = attMatrix[en.id]?.[d]
                                  return (
                                    <td key={d} className="px-2 py-3 text-center">
                                      {s ? (
                                        <span className="inline-flex w-7 h-7 rounded-full items-center justify-center
                                          text-xs font-bold mx-auto"
                                          style={{
                                            backgroundColor: s === 'present' ? '#dcfce7' : '#fee2e2',
                                            color: s === 'present' ? '#16a34a' : '#dc2626',
                                          }}>
                                          {s === 'present' ? 'P' : 'A'}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                                      )}
                                    </td>
                                  )
                                })}
                                <td className="px-4 py-3 text-center">
                                  <span className="font-semibold text-sm" style={{ color: pctCol }}>{pct}%</span>
                                </td>
                              </motion.tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  {uniqueDates.length === 0 && (
                    <p className="text-sm text-gray-400 py-10 text-center">
                      No attendance records yet for this class.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}