// src/pages/hod/TeacherDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'
import { SkeletonTable } from '../../components/ui/Skeleton'

export default function TeacherDetail() {
  const { id }                 = useParams()
  const navigate               = useNavigate()
  const [teacher, setTeacher]  = useState(null)
  const [classes, setClasses]  = useState([])
  const [loading, setLoading]  = useState(true)
  const [error,   setError]    = useState('')

  useEffect(() => {
    Promise.all([
      API.get(`/teachers/${id}/`),
      API.get('/classes/'),
    ]).then(([tRes, clsRes]) => {
      setTeacher(tRes.data)
      setClasses(clsRes.data.filter(c => c.teacher === parseInt(id)))
    }).catch(() => setError('Could not load teacher details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="space-y-4"><SkeletonTable rows={5} /></div>
  if (error)   return <p className="p-8 text-red-500">{error}</p>
  if (!teacher) return <p className="p-8 text-red-500">Teacher not found.</p>

  const infoRows = [
    { label: 'Full Name',      value: teacher.full_name },
    { label: 'Email',          value: teacher.email },
    { label: 'Employee ID',    value: teacher.employee_id },
    { label: 'Specialization', value: teacher.specialization || '—' },
    { label: 'Department',     value: teacher.department_name || teacher.department },
  ]

  return (
    <div>
      <motion.button onClick={() => navigate(-1)} whileHover={{ x: -2 }}
        className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200
          rounded-lg px-3 py-1.5 mb-6 bg-white hover:bg-gray-50 transition-colors">
        <ArrowLeft size={14} /> Back
      </motion.button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 p-6 mb-5 flex items-center gap-5">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center
            text-white text-2xl font-bold shrink-0">
          {teacher.full_name?.charAt(0).toUpperCase()}
        </motion.div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{teacher.full_name}</h2>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge label="Teacher" color="#0d9488" bg="#ccfbf1" />
            <span className="text-sm text-gray-400">{teacher.email}</span>
            <span className="text-sm text-gray-400">Emp ID: {teacher.employee_id}</span>
          </div>
        </div>
      </motion.div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Teacher Profile
        </p>
        <div className="divide-y divide-gray-50">
          {infoRows.map(({ label, value }) => (
            <div key={label} className="flex py-3">
              <span className="w-40 text-sm text-gray-400 shrink-0">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Classes card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Teaching Classes
          </p>
          <span className="text-xs text-gray-400">{classes.length} classes</span>
        </div>

        {classes.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                {['#', 'Subject', 'Academic Year', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((cls, idx) => {
                const [code, name] = cls.subject_name?.includes(' - ')
                  ? cls.subject_name.split(' - ')
                  : [null, cls.subject_name]
                return (
                  <motion.tr key={cls.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ backgroundColor: 'var(--hover-row)' }}
                    className="border-b border-gray-50">
                    <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3">
                      {code && <div className="text-xs font-bold text-amber-600 mb-0.5">{code}</div>}
                      <div className="font-medium text-gray-800">{name}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{cls.academic_year}</td>
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
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-sm text-gray-400">No classes assigned yet.</div>
        )}
      </motion.div>
    </div>
  )
}