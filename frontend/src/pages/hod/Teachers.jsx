// src/pages/hod/Teachers.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import { SkeletonTable } from '../../components/ui/Skeleton'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item      = { hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.25 } } }

export default function HODTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading,  setLoading]  = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/teachers/')
      .then(res => setTeachers(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Teachers in My Department"
        subtitle="Click on a teacher to view their details and classes"
      />

      {loading ? <SkeletonTable rows={5} /> : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {teachers.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No teachers found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  {['#', 'Name', 'Email', 'Employee ID', 'Specialization'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={container} initial="hidden" animate="show">
                {teachers.map((t, idx) => (
                  <motion.tr key={t.id} variants={item}
                    whileHover={{ backgroundColor: 'var(--hover-row)' }}
                    onClick={() => navigate(`/hod/teachers/${t.id}`)}
                    className="border-b border-gray-50 cursor-pointer">
                    <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center
                          justify-center text-white text-xs font-semibold shrink-0">
                          {t.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{t.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{t.email}</td>
                    <td className="px-5 py-3">
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-medium">
                        {t.employee_id}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{t.specialization || '—'}</td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          )}
        </motion.div>
      )}
    </div>
  )
}