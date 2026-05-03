// src/pages/student/Marks.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import API from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

const EXAM_LABEL = {
  internal1:  'Internal 1',
  internal2:  'Internal 2',
  assignment: 'Assignment',
  final:      'Final Exam',
}

export default function StudentMarks() {
  const [grades,  setGrades]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/grades/')
      .then(res => setGrades(res.data))
      .finally(() => setLoading(false))
  }, [])

  const grouped = grades.reduce((acc, grade) => {
    const subject = grade.subject_name
    if (!acc[subject]) acc[subject] = []
    acc[subject].push(grade)
    return acc
  }, {})

  if (loading) return (
    <div>
      <PageHeader title="My Marks" subtitle="Loading your grades..." />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="My Marks" subtitle="Your grades and performance by subject" />

      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mb-4 text-2xl">
            🎯
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No marks recorded yet</p>
          <p className="text-xs text-gray-400 mt-1">Your grades will appear here once entered by your teacher</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
          {Object.entries(grouped).map(([subject, gradeList], subjectIdx) => {
            const totalMarks = gradeList.reduce((s, g) => s + parseFloat(g.marks), 0)
            const totalMax   = gradeList.reduce((s, g) => s + parseFloat(g.max_marks), 0)
            const overall    = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0
            const color      = overall >= 75 ? '#16a34a' : overall >= 50 ? '#d97706' : '#dc2626'
            const bg         = overall >= 75 ? '#f0fdf4' : overall >= 50 ? '#fffbeb' : '#fef2f2'

            return (
              <motion.div key={subject} variants={item}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">

                {/* Subject header */}
                <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{subject}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${overall}%` }}
                          transition={{ duration: 0.8, delay: subjectIdx * 0.1, ease: 'easeOut' }} />
                      </div>
                    </div>
                    <Badge label={`Overall ${overall}%`} color={color} bg={bg} />
                  </div>
                </div>

                {/* Grades table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/60 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                      {['Exam', 'Marks', 'Max', 'Percentage', 'Remarks'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gradeList.map((g, idx) => {
                      const pctColor = g.percentage >= 75 ? '#16a34a'
                        : g.percentage >= 50 ? '#d97706' : '#dc2626'
                      const pctBg    = g.percentage >= 75 ? '#f0fdf4'
                        : g.percentage >= 50 ? '#fffbeb' : '#fef2f2'
                      return (
                        <motion.tr key={g.id}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: subjectIdx * 0.1 + idx * 0.05 }}
                          className="border-b border-gray-50 dark:border-gray-800
                            transition-colors duration-150
                            hover:bg-slate-50 dark:hover:bg-gray-800">
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                              text-xs font-medium bg-gray-100 dark:bg-gray-700
                              text-gray-600 dark:text-gray-300">
                              {EXAM_LABEL[g.exam_type] || g.exam_type}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-200">{g.marks}</td>
                          <td className="px-5 py-3 text-gray-400 dark:text-gray-500">{g.max_marks}</td>
                          <td className="px-5 py-3">
                            <Badge label={`${g.percentage}%`} color={pctColor} bg={pctBg} />
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500">{g.remarks || '—'}</td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Subject footer summary
                    FIX 1: bg-gray-50/40 → explicit dark:bg-gray-800 so footer is visible in dark mode
                    FIX 2: totalMarks.toFixed(2) to avoid raw float like 167.95000000000002 */}
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800
                  border-t border-gray-100 dark:border-gray-700
                  flex items-center gap-6">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Total: <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {Number.isInteger(totalMarks) ? totalMarks : totalMarks.toFixed(2)}
                    </span> / {totalMax}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {gradeList.length} exam{gradeList.length !== 1 ? 's' : ''} recorded
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}