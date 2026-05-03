// src/pages/principal/Departments.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import API from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'

const PALETTE = [
  { bg: '#f5f3ff', border: '#ddd6fe', accent: '#7c3aed', darkBg: '#1e1b4b', darkBorder: '#4c1d95' },
  { bg: '#fff7ed', border: '#fed7aa', accent: '#d97706', darkBg: '#451a03', darkBorder: '#92400e' },
  { bg: '#f0fdfa', border: '#99f6e4', accent: '#0d9488', darkBg: '#042f2e', darkBorder: '#115e59' },
  { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', darkBg: '#172554', darkBorder: '#1e40af' },
]

export default function PrincipalDepartments() {
  const [departments, setDepartments] = useState([])
  const [subjects,    setSubjects]    = useState([])
  const [teachers,    setTeachers]    = useState([])
  const [students,    setStudents]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [isDark,      setIsDark]      = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // detect dark mode
    setIsDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    )
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    Promise.all([
      API.get('/departments/'),
      API.get('/subjects/'),
      API.get('/auth/users/by-role/teacher/'),
      API.get('/auth/users/by-role/student/'),
    ]).then(([deptRes, subjRes, teachRes, studRes]) => {
      setDepartments(deptRes.data)
      setSubjects(subjRes.data)
      setTeachers(teachRes.data)
      setStudents(studRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} departments in the system`}
        action={
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input placeholder="Search departments..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((dept, idx) => {
            const palette      = PALETTE[idx % PALETTE.length]
            const deptSubjects = subjects.filter(s => s.department === dept.id)
            const cardBg       = isDark ? palette.darkBg     : palette.bg
            const cardBorder   = isDark ? palette.darkBorder : palette.border
            const subjectRowBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)'

            return (
              <motion.div key={dept.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                className="rounded-xl border p-5"
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

                {/* Header */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center
                    text-white text-xl font-bold shrink-0"
                    style={{ backgroundColor: palette.accent }}>
                    {dept.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-base" style={{ color: palette.accent }}>
                      {dept.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      HOD: {dept.hod_name || 'Not assigned'}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center border-y py-3 mb-4"
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                  {[
                    { num: deptSubjects.length, label: 'Subjects' },
                    { num: departments.length > 0 ? Math.round(students.length / departments.length) : 0, label: 'Students' },
                    { num: departments.length > 0 ? Math.round(teachers.length / departments.length) : 0, label: 'Teachers' },
                  ].map((s, i) => (
                    <div key={s.label} className="flex-1 flex flex-col items-center gap-0.5 relative">
                      {i > 0 && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-8"
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
                      )}
                      <span className="text-2xl font-bold" style={{ color: palette.accent }}>{s.num}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Subjects offered */}
                {deptSubjects.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Subjects offered
                    </p>
                    <div className="space-y-1.5">
                      {deptSubjects.map(s => (
                        <motion.div key={s.id}
                          whileHover={{ x: 2, borderColor: palette.accent }}
                          onClick={() => navigate(`/principal/subjects/${s.id}`)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors"
                          style={{ backgroundColor: subjectRowBg, borderColor: cardBorder }}>
                          <span className="text-xs font-bold" style={{ color: palette.accent }}>{s.code}</span>
                          <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{s.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
                            Sem {s.semester}
                          </span>
                          <span className="text-xs font-bold" style={{ color: palette.accent }}>→</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <p className="text-center text-sm text-gray-400 py-16">No departments found.</p>
      )}
    </div>
  )
}