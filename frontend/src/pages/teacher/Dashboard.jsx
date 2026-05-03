// src/pages/teacher/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'
import { motion } from 'framer-motion'
import { BookOpen, Users, Star, TrendingUp } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import { SkeletonTable } from '../../components/ui/Skeleton'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

export default function TeacherDashboard() {
  const { user }                  = useAuth()
  const [classes,     setClasses]     = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [grades,      setGrades]      = useState([])
  const [attendance,  setAttendance]  = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/classes/my-classes/'),
      API.get('/enrollments/'),
      API.get('/grades/'),
      API.get('/attendance/'),
    ]).then(([clsRes, enrRes, grRes, attRes]) => {
      setClasses(clsRes.data)
      setEnrollments(enrRes.data)
      setGrades(grRes.data)
      setAttendance(attRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const uniqueStudents = [...new Set(enrollments.map(e => e.student))].length
  const presentCount   = attendance.filter(a => a.status === 'present').length
  const totalAtt       = attendance.length
  const attPct         = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0
  const attColor       = attPct >= 75 ? '#16a34a' : attPct >= 50 ? '#d97706' : '#dc2626'

  const cards = [
    { label: 'My Classes',     value: classes.length, color: '#0d9488', bg: '#f0fdfa', icon: BookOpen   },
    { label: 'My Students',    value: uniqueStudents, color: '#2563eb', bg: '#eff6ff', icon: Users      },
    { label: 'Grades Added',   value: grades.length,  color: '#7c3aed', bg: '#f5f3ff', icon: Star       },
    { label: 'Avg Attendance', value: attPct,         color: attColor,
      bg: attPct >= 75 ? '#f0fdf4' : attPct >= 50 ? '#fffbeb' : '#fef2f2',
      icon: TrendingUp, suffix: '%' },
  ]

  const classPctMap = classes.map(cls => {
    const clsGrades = grades.filter(g => g.cls === cls.id)
    if (clsGrades.length === 0) return { ...cls, avgPct: null }
    const avg = Math.round(
      clsGrades.reduce((s, g) => s + parseFloat(g.percentage || 0), 0) / clsGrades.length
    )
    return { ...cls, avgPct: avg }
  })

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name}`}
        subtitle="Your teaching overview"
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
          <SkeletonTable rows={4} />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {cards.map((card, i) => (
              <motion.div key={card.label} variants={item}>
                <StatCard {...card} delay={i * 0.06} />
              </motion.div>
            ))}
          </motion.div>

          {/* Classes table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">My classes</h3>
              <span className="text-xs text-gray-400">{classes.length} classes</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60">
                  {['Subject', 'Academic Year', 'Students', 'Avg Grade', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classPctMap.map((cls, idx) => {
                  const enrolled = enrollments.filter(e => e.cls === cls.id).length
                  const [code, name] = cls.subject_name.includes(' - ')
                    ? cls.subject_name.split(' - ')
                    : [null, cls.subject_name]
                  const gradeColor = cls.avgPct == null ? '#94a3b8'
                    : cls.avgPct >= 75 ? '#16a34a'
                    : cls.avgPct >= 50 ? '#d97706' : '#dc2626'
                  return (
                    <motion.tr key={cls.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      className="border-b border-gray-50 dark:border-gray-800
                        transition-colors duration-150
                        hover:bg-slate-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{name}</div>
                        {code && <div className="text-xs text-gray-400 mt-0.5">{code}</div>}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{cls.academic_year}</td>
                      <td className="px-5 py-3">
                        <Badge label={`${enrolled} students`} color="#2563eb" bg="#dbeafe" />
                      </td>
                      <td className="px-5 py-3">
                        {cls.avgPct != null
                          ? <span className="font-semibold text-sm" style={{ color: gradeColor }}>{cls.avgPct}%</span>
                          : <span className="text-gray-400 text-xs">No grades</span>
                        }
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          label={cls.is_active ? 'Active' : 'Inactive'}
                          color={cls.is_active ? '#16a34a' : '#64748b'}
                          bg={cls.is_active ? '#dcfce7' : '#f1f5f9'}
                        />
                      </td>
                    </motion.tr>
                  )
                })}
                {classes.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                    No classes assigned yet
                  </td></tr>
                )}
              </tbody>
            </table>
          </motion.div>

          {/* Recent grades */}
          {grades.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recently added grades</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60">
                    {['Student', 'Subject', 'Exam', 'Marks', 'Percentage'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grades.slice(0, 6).map((g, idx) => {
                    const pctColor = g.percentage >= 75 ? '#16a34a'
                      : g.percentage >= 50 ? '#d97706' : '#dc2626'
                    return (
                      <motion.tr key={g.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 + idx * 0.04 }}
                        className="border-b border-gray-50 dark:border-gray-800
                          transition-colors duration-150
                          hover:bg-slate-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{g.student_name}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{g.subject_name}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{g.exam_type}</td>
                        <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{g.marks}/{g.max_marks}</td>
                        <td className="px-5 py-3">
                          <span className="font-semibold" style={{ color: pctColor }}>{g.percentage}%</span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}