// src/pages/hod/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'
import { motion } from 'framer-motion'
import { Users, GraduationCap, Layers, BookOpen } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import { SkeletonTable } from '../../components/ui/Skeleton'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

export default function HODDashboard() {
  const { user }              = useAuth()
  const [teachers,  setTeachers]  = useState([])
  const [students,  setStudents]  = useState([])
  const [classes,   setClasses]   = useState([])
  const [myClasses, setMyClasses] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/teachers/'),
      API.get('/students/'),
      API.get('/classes/'),
      API.get('/classes/my-classes/'),
    ]).then(([tRes, sRes, cRes, mcRes]) => {
      setTeachers(tRes.data)
      setStudents(sRes.data)
      setClasses(cRes.data)
      setMyClasses(mcRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const bySemester = students.reduce((acc, s) => {
    const sem = `Sem ${s.semester}`
    acc[sem] = (acc[sem] || 0) + 1
    return acc
  }, {})

  const cards = [
    { label: 'Teachers in Dept', value: teachers.length,  color: '#0d9488', bg: '#f0fdfa', icon: Users        },
    { label: 'Students in Dept', value: students.length,  color: '#2563eb', bg: '#eff6ff', icon: GraduationCap },
    { label: 'Total Classes',    value: classes.length,   color: '#7c3aed', bg: '#f5f3ff', icon: Layers       },
    { label: 'My Classes',       value: myClasses.length, color: '#d97706', bg: '#fffbeb', icon: BookOpen     },
  ]

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name}`}
        subtitle="Department overview"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Students by semester */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Students by semester</h3>
              </div>
              <div className="p-4 space-y-3">
                {Object.entries(bySemester).sort().map(([sem, count], idx) => {
                  const pct = Math.round((count / students.length) * 100)
                  return (
                    <div key={sem}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{sem}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{count} students</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.4 + idx * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )
                })}
                {Object.keys(bySemester).length === 0 && (
                  <p className="text-sm text-gray-400 py-4 text-center">No students yet</p>
                )}
              </div>
            </motion.div>

            {/* My teaching classes */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">My teaching classes</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Subject</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Year</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myClasses.map((cls, idx) => (
                    <motion.tr key={cls.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 + idx * 0.05 }}
                      className="border-b border-gray-50 dark:border-gray-800
                        transition-colors duration-150
                        hover:bg-slate-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{cls.subject_name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{cls.academic_year}</td>
                      <td className="px-4 py-3">
                        <Badge
                          label={cls.is_active ? 'Active' : 'Inactive'}
                          color={cls.is_active ? '#16a34a' : '#64748b'}
                          bg={cls.is_active ? '#dcfce7' : '#f1f5f9'}
                        />
                      </td>
                    </motion.tr>
                  ))}
                  {myClasses.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-400">
                      No classes assigned yet
                    </td></tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          </div>

          {/* Teachers in dept */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Teachers in department</h3>
              <span className="text-xs text-gray-400">{teachers.length} total</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60">
                  {['Name', 'Employee ID', 'Specialization'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, idx) => (
                  <motion.tr key={t.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + idx * 0.04 }}
                    className="border-b border-gray-50 dark:border-gray-800
                      transition-colors duration-150
                      hover:bg-slate-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{t.full_name}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{t.employee_id}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{t.specialization || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </>
      )}
    </div>
  )
}