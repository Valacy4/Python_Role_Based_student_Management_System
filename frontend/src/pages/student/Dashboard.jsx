// src/pages/student/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'
import { motion } from 'framer-motion'
import { BookMarked, Calendar, Target, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '../../components/ui/StatCard'
import PageHeader from '../../components/ui/PageHeader'
import { SkeletonCard } from '../../components/ui/Skeleton'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

// FIX: helper returns Tailwind className pairs instead of inline hex bg/text colors.
// Inline style backgroundColor is not overridable by dark: variants, so cards
// stayed light-green/yellow/red in dark mode making the subject name invisible.
function themeClasses(pct) {
  if (pct >= 75) return { card: 'bg-green-50  dark:bg-green-950',  text: 'text-green-600  dark:text-green-400'  }
  if (pct >= 50) return { card: 'bg-amber-50  dark:bg-amber-950',  text: 'text-amber-600  dark:text-amber-400'  }
  return            { card: 'bg-red-50     dark:bg-red-950',    text: 'text-red-600    dark:text-red-400'    }
}

export default function StudentDashboard() {
  const { user }                      = useAuth()
  const navigate                      = useNavigate()
  const [enrollments,  setEnrollments]  = useState([])
  const [attendance,   setAttendance]   = useState([])
  const [grades,       setGrades]       = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/enrollments/'),
      API.get('/attendance/'),
      API.get('/grades/'),
    ]).then(([enrRes, attRes, grRes]) => {
      setEnrollments(enrRes.data)
      setAttendance(attRes.data)
      setGrades(grRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const totalAtt   = attendance.length
  const presentAtt = attendance.filter(a => a.status === 'present').length
  const absentAtt  = attendance.filter(a => a.status === 'absent').length
  const lateAtt    = attendance.filter(a => a.status === 'late').length
  const attPct     = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0
  const attColor   = attPct >= 75 ? '#16a34a' : attPct >= 50 ? '#d97706' : '#dc2626'

  const attBySubject = attendance.reduce((acc, a) => {
    if (!acc[a.subject_name]) acc[a.subject_name] = { present: 0, absent: 0, late: 0, total: 0 }
    acc[a.subject_name][a.status]++
    acc[a.subject_name].total++
    return acc
  }, {})

  const gradesBySubject = grades.reduce((acc, g) => {
    if (!acc[g.subject_name]) acc[g.subject_name] = []
    acc[g.subject_name].push(g)
    return acc
  }, {})

  const subjectAvgs = Object.entries(gradesBySubject).map(([subj, gs]) => {
    const total    = gs.reduce((s, g) => s + parseFloat(g.marks), 0)
    const maxTotal = gs.reduce((s, g) => s + parseFloat(g.max_marks), 0)
    const pct      = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0
    return { subject: subj, percentage: pct }
  })

  const overallGradePct = subjectAvgs.length > 0
    ? Math.round(subjectAvgs.reduce((s, sg) => s + sg.percentage, 0) / subjectAvgs.length)
    : 0
  const gradeColor = overallGradePct >= 75 ? '#16a34a' : overallGradePct >= 50 ? '#d97706' : '#dc2626'

  const donutData = [
    { name: 'Present', value: presentAtt, color: '#16a34a' },
    { name: 'Absent',  value: absentAtt,  color: '#dc2626' },
    { name: 'Late',    value: lateAtt,    color: '#d97706' },
  ].filter(d => d.value > 0)

  const cards = [
    { label: 'Enrolled Subjects',  value: enrollments.length, color: '#2563eb', bg: '#eff6ff',   icon: BookMarked,  sub: 'active subjects' },
    { label: 'Overall Attendance', value: attPct,             color: attColor,  bg: attPct >= 75 ? '#f0fdf4' : attPct >= 50 ? '#fffbeb' : '#fef2f2', icon: Calendar,   sub: `${presentAtt} present / ${totalAtt} classes` },
    { label: 'Overall Grade',      value: overallGradePct,    color: gradeColor, bg: overallGradePct >= 75 ? '#f0fdf4' : overallGradePct >= 50 ? '#fffbeb' : '#fef2f2', icon: Target, sub: `across ${subjectAvgs.length} subjects` },
    { label: 'Classes Attended',   value: presentAtt,         color: '#7c3aed', bg: '#f5f3ff',   icon: CheckCircle, sub: `${absentAtt} absent · ${lateAtt} late` },
  ]

  if (loading) return (
    <div>
      <PageHeader title="Dashboard" subtitle="Loading your overview..." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.full_name}!
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Here's your academic overview
          </motion.p>
        </div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center
            text-white text-lg font-bold shadow-sm">
          {user?.full_name?.charAt(0).toUpperCase()}
        </motion.div>
      </div>

      {/* Stat cards */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {cards.map((card, i) => (
          <motion.div key={card.label} variants={item}>
            <StatCard {...card} delay={i * 0.06} />
          </motion.div>
        ))}
      </motion.div>

      {/* Donut + Grade bars */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Attendance donut */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Attendance breakdown
          </h3>
          {totalAtt > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    paddingAngle={3} dataKey="value"
                    animationBegin={300} animationDuration={800}>
                    {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val} classes`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center -mt-4 mb-3">
                <span className="text-2xl font-bold" style={{ color: attColor }}>{attPct}%</span>
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                {[
                  { label: `Present (${presentAtt})`, color: '#16a34a' },
                  { label: `Absent (${absentAtt})`,   color: '#dc2626' },
                  { label: `Late (${lateAtt})`,        color: '#d97706' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No attendance data yet</p>
          )}
        </motion.div>

        {/* Grade bars */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Grade percentage by subject
          </h3>
          {subjectAvgs.length > 0 ? (
            <div className="space-y-4">
              {subjectAvgs.map((sg, idx) => {
                const c = sg.percentage >= 75 ? '#16a34a' : sg.percentage >= 50 ? '#d97706' : '#dc2626'
                return (
                  <div key={sg.subject}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[220px]">
                        {sg.subject}
                      </span>
                      <span className="font-semibold ml-2" style={{ color: c }}>{sg.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: c }}
                        initial={{ width: 0 }} animate={{ width: `${sg.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.45 + idx * 0.08, ease: 'easeOut' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No grades recorded yet</p>
          )}
        </motion.div>
      </div>

      {/* Attendance per subject */}
      {Object.keys(attBySubject).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Attendance per subject
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(attBySubject).map(([subj, data], idx) => {
              const pct    = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
              const col    = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'
              // FIX: was inline style={{ backgroundColor: bg }} with hardcoded hex.
              // Inline styles cannot be overridden by Tailwind dark: variants, so the
              // card stayed light green/yellow/red in dark mode making text invisible.
              // Now uses themeClasses() which returns Tailwind className strings with
              // paired dark: variants that work correctly with the .dark class toggle.
              const theme  = themeClasses(pct)
              return (
                <motion.div key={subj}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + idx * 0.05 }}
                  className={`rounded-xl p-4 text-center ${theme.card}`}
                >
                  <div className={`text-2xl font-bold mb-1 ${theme.text}`}>{pct}%</div>
                  {/* FIX: was text-gray-700 — invisible on light bg in dark mode.
                      Now dark:text-gray-300 ensures readability on dark:bg-*-950 */}
                  <div className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-2 truncate">
                    {subj}
                  </div>
                  <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: col }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.6 + idx * 0.06, ease: 'easeOut' }} />
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    <span style={{ color: '#16a34a' }}>{data.present}P</span>
                    {' · '}
                    <span style={{ color: '#dc2626' }}>{data.absent}A</span>
                    {' · '}
                    <span style={{ color: '#d97706' }}>{data.late}L</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Enrolled subjects */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          My enrolled subjects
        </h3>
        {enrollments.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {enrollments.map((en, idx) => {
              const parts    = en.class_name.split(' - ')
              const subjCode = parts[0]
              const subjName = parts[1]?.split(' | ')[0] || en.class_name
              return (
                <motion.div key={en.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + idx * 0.05 }}
                  whileHover={{ y: -2, borderColor: '#2563eb' }}
                  onClick={() => navigate('/student/attendance')}
                  // FIX: was bg-gray-50 — maps to #1f2937 in dark mode via index.css
                  // override which makes the blue subject code and gray text both readable.
                  // Added dark:border-gray-700 and dark:text-* for all text inside.
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700
                    bg-gray-50 dark:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
                    {subjCode}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
                    {subjName}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Enrolled {new Date(en.enrolled_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">
            Not enrolled in any subjects yet
          </p>
        )}
      </motion.div>
    </div>
  )
}