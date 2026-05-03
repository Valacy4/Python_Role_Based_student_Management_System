// src/pages/student/Attendance.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import API from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

export default function StudentAttendance() {
  const [records,  setRecords]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    API.get('/attendance/')
      .then(res => setRecords(res.data))
      .finally(() => setLoading(false))
  }, [])

  const grouped = records.reduce((acc, record) => {
    const subject = record.subject_name
    if (!acc[subject]) acc[subject] = { present: 0, absent: 0, late: 0, records: [] }
    acc[subject][record.status]++
    acc[subject].records.push(record)
    return acc
  }, {})

  const toggleExpand = (subject) =>
    setExpanded(prev => ({ ...prev, [subject]: !prev[subject] }))

  if (loading) return (
    <div>
      <PageHeader title="My Attendance" subtitle="Loading your attendance records..." />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="My Attendance" subtitle="Your attendance records by subject" />

      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950 rounded-2xl flex items-center justify-center mb-4 text-2xl">
            📅
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No attendance records found</p>
          <p className="text-xs text-gray-400 mt-1">Your attendance will appear here once marked</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {Object.entries(grouped).map(([subject, data], subjectIdx) => {
            const total      = data.present + data.absent + data.late
            const percentage = total > 0 ? Math.round((data.present / total) * 100) : 0
            const color      = percentage >= 75 ? '#16a34a' : percentage >= 50 ? '#d97706' : '#dc2626'
            const bg         = percentage >= 75 ? '#f0fdf4' : percentage >= 50 ? '#fffbeb' : '#fef2f2'
            const isOpen     = expanded[subject]

            return (
              <motion.div key={subject} variants={item}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">

                {/* Subject header — clickable to expand
                    FIX: replaced whileHover={{ backgroundColor: '#f9fafb' }} with Tailwind
                    hover classes so dark mode gets the correct bg instead of a white flash */}
                <div
                  onClick={() => toggleExpand(subject)}
                  className="px-5 py-4 cursor-pointer transition-colors duration-150
                    hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{subject}</h3>
                    <div className="flex items-center gap-2.5">
                      <Badge label={`${percentage}% attendance`} color={color} bg={bg} />
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400 text-xs">
                        ▼
                      </motion.span>
                    </div>
                  </div>

                  {/* Animated progress bar */}
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: subjectIdx * 0.1, ease: 'easeOut' }} />
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-5">
                    {[
                      { label: 'Present', value: data.present, color: '#16a34a' },
                      { label: 'Absent',  value: data.absent,  color: '#dc2626' },
                      { label: 'Late',    value: data.late,    color: '#d97706' },
                      { label: 'Total',   value: total,        color: '#6366f1' },
                    ].map(s => (
                      <div key={s.label} className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expandable records table */}
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden">
                  <div className="border-t border-gray-50 dark:border-gray-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50/60 dark:bg-gray-800/60">
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Date</th>
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.records
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map((r, idx) => {
                            const sc = r.status === 'present' ? '#16a34a' : r.status === 'absent' ? '#dc2626' : '#d97706'
                            const sb = r.status === 'present' ? '#dcfce7' : r.status === 'absent' ? '#fee2e2' : '#fef9c3'
                            return (
                              <motion.tr key={r.id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="border-b border-gray-50 dark:border-gray-800
                                  transition-colors duration-150
                                  hover:bg-slate-50 dark:hover:bg-gray-800">
                                <td className="px-5 py-2.5 text-gray-600 dark:text-gray-400">
                                  {new Date(r.date).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                  })}
                                </td>
                                <td className="px-5 py-2.5">
                                  <Badge label={r.status} color={sc} bg={sb} />
                                </td>
                              </motion.tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}