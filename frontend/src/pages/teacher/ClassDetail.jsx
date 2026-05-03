// src/pages/teacher/ClassDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, X, Download, Search, UserMinus } from 'lucide-react'
import API from '../../api/axios'
import { downloadCSV, downloadExcel } from '../../utils/exportClass'
import AutoSearch from '../../components/AutoSearch'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonTable } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function ClassDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [cls,         setCls]         = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [grades,      setGrades]      = useState([])
  const [search,      setSearch]      = useState('')
  const [addSearch,   setAddSearch]   = useState('')
  const [loading,     setLoading]     = useState(true)
  const [showAdd,     setShowAdd]     = useState(false)
  const [adding,      setAdding]      = useState(false)
  const [removing,    setRemoving]    = useState(null)

  const loadData = () => {
    Promise.all([
      API.get(`/classes/${id}/`),
      API.get('/enrollments/'),
      API.get('/students/'),
      API.get('/grades/'),
    ]).then(([clsRes, enrRes, stuRes, grRes]) => {
      setCls(clsRes.data)
      setEnrollments(enrRes.data.filter(e => e.cls === parseInt(id)))
      setAllStudents(stuRes.data)
      setGrades(grRes.data)
    }).catch(() => toast.error('Could not load class details.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [id])

  const enrolledStudentIds = enrollments.map(e => e.student)

  const availableStudents = allStudents.filter(s =>
    !enrolledStudentIds.includes(s.user) && (
      s.full_name.toLowerCase().includes(addSearch.toLowerCase()) ||
      (s.roll_number || '').toLowerCase().includes(addSearch.toLowerCase())
    )
  )

  const filteredEnrollments = enrollments.filter(e =>
    e.student_name.toLowerCase().includes(search.toLowerCase()) ||
    e.roll_number.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (studentProfileId) => {
    setAdding(true)
    try {
      await API.post('/enrollments/', { student: studentProfileId, cls: parseInt(id) })
      toast.success('Student added successfully!')
      setAddSearch('')
      loadData()
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to add student.'
      )
    } finally { setAdding(false) }
  }

  const handleRemove = async (enrollmentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this class?`)) return
    setRemoving(enrollmentId)
    try {
      await API.delete(`/enrollments/${enrollmentId}/`)
      toast.success('Student removed.')
      loadData()
    } catch { toast.error('Failed to remove student.') }
    finally { setRemoving(null) }
  }

  const subjectName = cls?.subject_name?.split(' - ')[1] || cls?.subject_name || 'Subject'
  const semester    = cls?.semester || '?'
  const [code, name] = cls?.subject_name?.includes(' - ')
    ? cls.subject_name.split(' - ')
    : [null, cls?.subject_name]

  if (loading) return <div className="space-y-4"><SkeletonTable rows={6} /></div>
  if (!cls)    return <p className="p-8 text-red-500">Class not found.</p>

  return (
    <div>
      <motion.button onClick={() => navigate(-1)} whileHover={{ x: -2 }}
        className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200
          rounded-lg px-3 py-1.5 mb-6 bg-white hover:bg-gray-50 transition-colors">
        <ArrowLeft size={14} /> Back
      </motion.button>

      {/* Class header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 p-6 mb-5 flex justify-between items-start">
        <div>
          {code && <p className="text-xs font-bold text-teal-600 tracking-wider mb-1">{code}</p>}
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{name}</h2>
          <p className="text-sm text-gray-400">
            {cls.academic_year} · Teacher: {cls.teacher_name} · Semester {semester}
          </p>
        </div>
        <div className="bg-teal-50 px-6 py-4 rounded-xl text-center shrink-0">
          <div className="text-3xl font-bold text-teal-600">{enrollments.length}</div>
          <div className="text-xs text-teal-500 font-medium mt-0.5">Students enrolled</div>
        </div>
      </motion.div>

      {/* Students card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden">

        {/* Card header */}
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Enrolled Students</h3>
          <div className="flex gap-2 items-center">
            {enrollments.length > 0 && (
              <>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => downloadCSV(enrollments, grades, subjectName, semester)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <Download size={12} /> CSV
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => downloadExcel(enrollments, grades, subjectName, semester)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <Download size={12} /> Excel
                </motion.button>
              </>
            )}
            <Button onClick={() => { setShowAdd(!showAdd); setAddSearch('') }} color="#0d9488" size="sm">
              {showAdd ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Student</>}
            </Button>
          </div>
        </div>

        {/* Add student panel */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-gray-50">
              <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900">
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    autoFocus
                    placeholder="Search student by name or roll number to add..."
                    value={addSearch}
                    onChange={e => setAddSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                      outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  />
                </div>

                <AnimatePresence>
                  {addSearch && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="border border-gray-200 rounded-lg bg-white overflow-hidden max-h-60 overflow-y-auto">
                      {availableStudents.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">
                          No available students found. They may already be enrolled.
                        </p>
                      ) : (
                        availableStudents.slice(0, 8).map((s, idx) => (
                          <motion.div key={s.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.04 }}
                            className="flex items-center justify-between px-4 py-3 border-b border-gray-50
                              hover:bg-gray-50 transition-colors">
                            <div>
                              <div className="text-sm font-medium text-gray-800">{s.full_name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                {s.roll_number} · Sem {s.semester}
                              </div>
                            </div>
                            <Button onClick={() => handleAdd(s.id)} disabled={adding}
                              color="#0d9488" size="sm">
                              {adding ? 'Adding...' : 'Add'}
                            </Button>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50">
          <div className="flex-1">
            <AutoSearch
              placeholder="Search enrolled students..."
              items={enrollments}
              searchKeys={['student_name', 'roll_number']}
              storageKey={`class_${id}_search`}
              onSearch={val => setSearch(val)}
              onSelect={en => setSearch(en.student_name)}
            />
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {filteredEnrollments.length} of {enrollments.length} students
          </span>
        </div>

        {/* Table */}
        {filteredEnrollments.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                {['#', 'Name', 'Roll Number', 'Enrolled On', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((en, idx) => (
                <motion.tr key={en.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  // ✅ FIX: removed whileHover={{ backgroundColor }} — see Table.jsx note.
                  // CSS transition-colors is instant and dark-mode aware.
                  className="border-b border-gray-50 dark:border-gray-800
                    transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="px-5 py-3 text-gray-400 dark:text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600
                        dark:text-teal-400 flex items-center justify-center font-semibold text-xs shrink-0">
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
                    {new Date(en.enrolled_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemove(en.id, en.student_name)}
                      disabled={removing === en.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                        bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400
                        border border-red-200 dark:border-red-800 rounded-lg
                        hover:bg-red-100 dark:hover:bg-red-900 transition-colors disabled:opacity-50">
                      <UserMinus size={12} />
                      {removing === en.id ? 'Removing...' : 'Remove'}
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-sm text-gray-400">
            {search
              ? `No students found matching "${search}"`
              : 'No students enrolled yet. Click "+ Add Student" to enroll students.'}
          </div>
        )}
      </motion.div>
    </div>
  )
}