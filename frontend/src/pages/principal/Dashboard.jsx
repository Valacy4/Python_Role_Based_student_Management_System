// src/pages/principal/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'
import { motion } from 'framer-motion'
import { Users, Building2, BookOpen, GraduationCap,
         Layers, ClipboardList, UserCheck, LayoutDashboard } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import { SkeletonTable } from '../../components/ui/Skeleton'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

const ROLE_META = {
  principal: { color: '#7c3aed', bg: '#f5f3ff', label: 'Principal' },
  hod:       { color: '#d97706', bg: '#fef3c7', label: 'HOD'       },
  teacher:   { color: '#0d9488', bg: '#ccfbf1', label: 'Teacher'   },
  student:   { color: '#2563eb', bg: '#dbeafe', label: 'Student'   },
}

export default function PrincipalDashboard() {
  const { user } = useAuth()
  const [stats, setStats]             = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/auth/users/'),
      API.get('/departments/'),
      API.get('/subjects/'),
      API.get('/classes/'),
      API.get('/enrollments/'),
    ]).then(([usersRes, deptsRes, subjRes, clsRes, enrRes]) => {
      const users = usersRes.data
      setStats({
        total_users:  users.length,
        principals:   users.filter(u => u.role === 'principal').length,
        hods:         users.filter(u => u.role === 'hod').length,
        teachers:     users.filter(u => u.role === 'teacher').length,
        students:     users.filter(u => u.role === 'student').length,
        departments:  deptsRes.data.length,
        subjects:     subjRes.data.length,
        classes:      clsRes.data.length,
        enrollments:  enrRes.data.length,
      })
      setRecentUsers(users.slice(0, 8))
    }).finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Departments', value: stats.departments, color: '#7c3aed', bg: '#f5f3ff', icon: Building2    },
    { label: 'HODs',        value: stats.hods,        color: '#d97706', bg: '#fffbeb', icon: UserCheck    },
    { label: 'Teachers',    value: stats.teachers,    color: '#0d9488', bg: '#f0fdfa', icon: Users        },
    { label: 'Students',    value: stats.students,    color: '#2563eb', bg: '#eff6ff', icon: GraduationCap },
    { label: 'Subjects',    value: stats.subjects,    color: '#db2777', bg: '#fdf2f8', icon: BookOpen     },
    { label: 'Classes',     value: stats.classes,     color: '#16a34a', bg: '#f0fdf4', icon: Layers       },
    { label: 'Enrollments', value: stats.enrollments, color: '#dc2626', bg: '#fef2f2', icon: ClipboardList },
    { label: 'Total Users', value: stats.total_users, color: '#475569', bg: '#f1f5f9', icon: LayoutDashboard },
  ] : []

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name}`}
        subtitle="System overview — all departments"
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
          <SkeletonTable rows={5} />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {cards.map((card, i) => (
              <motion.div key={card.label} variants={item}>
                <StatCard {...card} delay={i * 0.05} />
              </motion.div>
            ))}
          </motion.div>

          {/* Role breakdown bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">User distribution</h3>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
              {[
                { count: stats.hods,     color: '#d97706' },
                { count: stats.teachers, color: '#0d9488' },
                { count: stats.students, color: '#2563eb' },
              ].map((seg, i) => (
                <motion.div key={i}
                  initial={{ width: 0 }}
                  animate={{ width: `${(seg.count / stats.total_users) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: 'easeOut' }}
                  style={{ backgroundColor: seg.color }}
                  className="rounded-full"
                />
              ))}
            </div>
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'HODs',     count: stats.hods,     color: '#d97706' },
                { label: 'Teachers', count: stats.teachers, color: '#0d9488' },
                { label: 'Students', count: stats.students, color: '#2563eb' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label} <span className="font-semibold text-gray-700 dark:text-gray-300">{s.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent users table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent users</h3>
              <span className="text-xs text-gray-400">{stats.total_users} total</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Role</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, idx) => {
                  const meta = ROLE_META[u.role] || { color: '#64748b', bg: '#f1f5f9', label: u.role }
                  return (
                    <motion.tr key={u.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.04 }}
                      className="border-b border-gray-50 dark:border-gray-800
                        transition-colors duration-150
                        hover:bg-slate-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="px-5 py-3">
                        <Badge label={meta.label} color={meta.color} bg={meta.bg} />
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        </>
      )}
    </div>
  )
}