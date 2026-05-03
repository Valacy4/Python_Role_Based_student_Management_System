// src/pages/principal/SubjectDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Search } from 'lucide-react'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'
import { SkeletonTable } from '../../components/ui/Skeleton'

export default function SubjectDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [subject,     setSubject]     = useState(null)
  const [classInfo,   setClassInfo]   = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')

  useEffect(() => {
    Promise.all([API.get(`/subjects/${id}/`), API.get('/classes/'), API.get('/enrollments/')])
      .then(([subjRes, clsRes, enrRes]) => {
        const subj = subjRes.data
        setSubject(subj)
        const cls = clsRes.data.find(c => c.subject === parseInt(id))
        setClassInfo(cls || null)
        if (cls) setEnrollments(enrRes.data.filter(e => e.cls === cls.id))
      }).finally(() => setLoading(false))
  }, [id])

  const filtered = enrollments.filter(e =>
    e.student_name.toLowerCase().includes(search.toLowerCase()) ||
    e.roll_number.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="space-y-4"><SkeletonTable rows={5} /></div>
  if (!subject) return <p className="p-8 text-red-500">Subject not found.</p>

  return (
    <div>
      <motion.button onClick={() => navigate(-1)} whileHover={{ x: -2 }}
        className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200
          rounded-lg px-3 py-1.5 mb-6 bg-white hover:bg-gray-50 transition-colors">
        <ArrowLeft size={14} /> Back to Departments
      </motion.button>

      {/* Subject header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 p-6 mb-5 flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-indigo-600 tracking-wider mb-1">{subject.code}</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{subject.name}</h2>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: `Semester ${subject.semester}`, color: '#7c3aed', bg: '#f5f3ff' },
              { label: `${subject.credits} Credits`,   color: '#7c3aed', bg: '#f5f3ff' },
              { label: subject.department_name,        color: '#7c3aed', bg: '#f5f3ff' },
            ].map(b => <Badge key={b.label} {...b} />)}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-indigo-50 px-6 py-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-indigo-600">{enrollments.length}</div>
            <div className="text-xs text-indigo-500 font-medium mt-0.5">Students</div>
          </div>
          <div className={`px-6 py-4 rounded-xl text-center ${classInfo?.is_active ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${classInfo?.is_active ? 'text-green-600' : 'text-gray-400'}`}>
              {classInfo?.is_active ? '✓' : '✗'}
            </div>
            <div className={`text-xs font-medium mt-0.5 ${classInfo?.is_active ? 'text-green-500' : 'text-gray-400'}`}>
              {classInfo?.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Teacher card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Teacher</p>
        {classInfo ? (
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center
              text-white text-lg font-semibold shrink-0">
              {classInfo.teacher_name?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{classInfo.teacher_name}</div>
              <div className="text-sm text-gray-400 mt-0.5">Academic Year: {classInfo.academic_year}</div>
            </div>
            <Badge
              label={classInfo.is_active ? 'Active' : 'Inactive'}
              color={classInfo.is_active ? '#16a34a' : '#64748b'}
              bg={classInfo.is_active ? '#dcfce7' : '#f1f5f9'}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400">No teacher assigned yet.</p>
        )}
      </motion.div>

      {/* Students table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Enrolled Students</h3>
            <p className="text-xs text-gray-400 mt-0.5">{enrollments.length} students in Sem {subject.semester}</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input placeholder="Search by name or roll no..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                outline-none focus:ring-2 focus:ring-indigo-500 w-56" />
          </div>
        </div>
        {filtered.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                {['#', 'Student Name', 'Roll Number', 'Enrolled On'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((en, idx) => (
                <motion.tr key={en.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  // ✅ FIX: removed whileHover={{ backgroundColor }} — see Table.jsx note.
                  className="border-b border-gray-50 dark:border-gray-800
                    transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="px-5 py-3 text-gray-400 dark:text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600
                        dark:text-indigo-400 flex items-center justify-center font-semibold text-xs shrink-0">
                        {en.student_name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{en.student_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300
                      px-2 py-0.5 rounded text-xs font-medium">
                      {en.roll_number}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(en.enrolled_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-sm text-gray-400">
            {search ? `No students matching "${search}"` : 'No students enrolled yet.'}
          </div>
        )}
      </motion.div>
    </div>
  )
}