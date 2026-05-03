// src/pages/hod/Students.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../../api/axios'
import AutoSearch from '../../components/AutoSearch'
import PageHeader from '../../components/ui/PageHeader'
import { SkeletonTable } from '../../components/ui/Skeleton'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const item      = { hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.25 } } }

export default function HODStudents() {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/students/')
      .then(res => setStudents(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Students in My Department"
        subtitle="Click on a student to view their full details"
        action={
          <AutoSearch
            placeholder="Search by name or roll no..."
            items={students}
            searchKeys={['full_name', 'roll_number']}
            storageKey="hod_students_search"
            onSearch={val => setSearch(val)}
            onSelect={s => setSearch(s.full_name)}
          />
        }
      />

      {loading ? <SkeletonTable rows={6} /> : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">
              {search ? `No students matching "${search}"` : 'No students found.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  {['#', 'Name', 'Roll Number', 'Semester', 'Batch Year', 'Email'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={container} initial="hidden" animate="show">
                {filtered.map((s, idx) => (
                  <motion.tr key={s.id} variants={item}
                    whileHover={{ backgroundColor: 'var(--hover-row)' }}
                    onClick={() => navigate(`/hod/students/${s.id}`)}
                    className="border-b border-gray-50 cursor-pointer">
                    <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center
                          justify-center text-white text-xs font-semibold shrink-0">
                          {s.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{s.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-medium">
                        {s.roll_number}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">Sem {s.semester}</td>
                    <td className="px-5 py-3 text-gray-500">{s.batch_year}</td>
                    <td className="px-5 py-3 text-gray-500">{s.email}</td>
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