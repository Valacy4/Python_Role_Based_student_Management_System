// src/pages/hod/MyClasses.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import API from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

export default function HODMyClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/classes/my-classes/')
      .then(res => setClasses(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="My Teaching Classes"
        subtitle="Click on a class to view and manage students"
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-amber-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">No classes assigned yet</p>
          <p className="text-xs text-gray-400 mt-1">Contact the principal to get assigned</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map(cls => {
            const [code, name] = cls.subject_name.includes(' - ')
              ? cls.subject_name.split(' - ')
              : [null, cls.subject_name]
            return (
              <motion.div key={cls.id} variants={item}
                whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/hod/my-classes/${cls.id}`)}
                className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer transition-shadow">
                <div className="h-1 rounded-full bg-amber-500 mb-4 w-10" />
                {code && (
                  <p className="text-xs font-bold text-amber-600 tracking-wider mb-1">{code}</p>
                )}
                <h3 className="text-base font-semibold text-gray-900 mb-1 leading-snug">{name}</h3>
                <p className="text-xs text-gray-400 mb-4">{cls.academic_year}</p>
                <div className="flex items-center justify-between">
                  <Badge
                    label={cls.is_active ? 'Active' : 'Inactive'}
                    color={cls.is_active ? '#16a34a' : '#94a3b8'}
                    bg={cls.is_active ? '#dcfce7' : '#f1f5f9'}
                  />
                  <span className="text-xs text-amber-600 font-medium">View students →</span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}