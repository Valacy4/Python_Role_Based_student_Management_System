// src/pages/principal/DeleteBatch.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react'
import API from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import toast from 'react-hot-toast'

export default function DeleteBatch() {
  const navigate                      = useNavigate()
  const [departments, setDepartments] = useState([])
  const [students,    setStudents]    = useState([])
  const [deptFilter,  setDeptFilter]  = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [semFilter,   setSemFilter]   = useState('')
  const [selected,    setSelected]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [deleting,    setDeleting]    = useState(false)

  useEffect(() => {
    Promise.all([API.get('/departments/'), API.get('/students/')])
      .then(([deptRes, stuRes]) => {
        setDepartments(deptRes.data)
        setStudents(stuRes.data)
      }).finally(() => setLoading(false))
  }, [])

  const batchYears = [...new Set(students.map(s => s.batch_year))].sort((a, b) => b - a)

  const filtered = students.filter(s => {
    const matchDept  = !deptFilter  || s.department === parseInt(deptFilter)
    const matchBatch = !batchFilter || s.batch_year  === parseInt(batchFilter)
    const matchSem   = !semFilter   || s.semester    === parseInt(semFilter)
    return matchDept && matchBatch && matchSem
  })

  const toggleSelect = id =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(s => s.user))

  const handleDelete = async () => {
    if (selected.length === 0) { toast.error('No students selected.'); return }
    if (!window.confirm(
      `Permanently delete ${selected.length} student(s)?\n\nThis also removes their enrollments, attendance and grades.`
    )) return

    setDeleting(true)
    let successCount = 0, failCount = 0
    for (const userId of selected) {
      try { await API.delete(`/auth/users/${userId}/`); successCount++ }
      catch { failCount++ }
    }
    const res = await API.get('/students/')
    setStudents(res.data)
    setSelected([])
    setDeleting(false)

    if (failCount === 0) toast.success(`Deleted ${successCount} student(s).`)
    else toast.error(`Deleted ${successCount}, failed ${failCount}.`)
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading...</div>

  return (
    <div>
      <motion.button onClick={() => navigate(-1)} whileHover={{ x: -2 }}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
          border border-gray-200 dark:border-gray-700
          rounded-lg px-3 py-1.5 mb-6
          bg-white dark:bg-gray-800
          hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <ArrowLeft size={14} /> Back
      </motion.button>

      <PageHeader
        title="Delete Batch Students"
        subtitle="Filter students by department, batch year or semester, select them, then delete."
      />

      {/* Warning banner */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950
          border border-amber-200 dark:border-amber-800
          rounded-xl p-4 mb-6">
        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          This permanently deletes selected students and all their data
          (enrollments, attendance, grades). This cannot be undone.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Filter Students</p>
        <div className="flex gap-4 flex-wrap items-end">
          {[
            {
              label: 'Department', value: deptFilter,
              onChange: e => { setDeptFilter(e.target.value); setSelected([]) },
              options: [
                <option key="" value="">All Departments</option>,
                ...departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
              ]
            },
            {
              label: 'Batch Year', value: batchFilter,
              onChange: e => { setBatchFilter(e.target.value); setSelected([]) },
              options: [
                <option key="" value="">All Batches</option>,
                ...batchYears.map(y => <option key={y} value={y}>{y}</option>)
              ]
            },
            {
              label: 'Semester', value: semFilter,
              onChange: e => { setSemFilter(e.target.value); setSelected([]) },
              options: [
                <option key="" value="">All Semesters</option>,
                ...[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)
              ]
            }
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}</label>
              <select value={f.value} onChange={f.onChange}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700
                  rounded-lg text-sm outline-none
                  focus:ring-2 focus:ring-indigo-500
                  bg-white dark:bg-gray-800
                  text-gray-800 dark:text-gray-200
                  min-w-[160px]">
                {f.options}
              </select>
            </div>
          ))}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setDeptFilter(''); setBatchFilter(''); setSemFilter(''); setSelected([]) }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700
              text-gray-600 dark:text-gray-300
              border border-gray-200 dark:border-gray-600
              rounded-lg text-sm cursor-pointer
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors self-end">
            Clear Filters
          </motion.button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {filtered.length} students found
            {selected.length > 0 && (
              <span className="text-red-500 font-semibold"> · {selected.length} selected</span>
            )}
          </div>
          <motion.button
            onClick={handleDelete}
            disabled={selected.length === 0 || deleting}
            whileHover={selected.length > 0 ? { scale: 1.02 } : {}}
            whileTap={selected.length > 0 ? { scale: 0.98 } : {}}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm
              font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors hover:bg-red-700">
            <Trash2 size={14} />
            {deleting ? 'Deleting...' : `Delete Selected (${selected.length})`}
          </motion.button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/60 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
              <th className="px-5 py-3 w-10">
                <input type="checkbox"
                  checked={filtered.length > 0 && selected.length === filtered.length}
                  onChange={toggleAll} className="cursor-pointer accent-indigo-600" />
              </th>
              {['Name', 'Roll Number', 'Department', 'Semester', 'Batch Year', 'Email'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, idx) => {
              const isSelected = selected.includes(s.user)
              return (
                <motion.tr key={s.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => toggleSelect(s.user)}
                  className={`border-b border-gray-50 dark:border-gray-800 cursor-pointer transition-colors
                    ${isSelected
                      ? 'bg-red-50 dark:bg-red-950'
                      : 'hover:bg-slate-50 dark:hover:bg-gray-800'
                    }`}>
                  <td className="px-5 py-3">
                    <input type="checkbox" checked={isSelected}
                      onChange={() => toggleSelect(s.user)}
                      onClick={e => e.stopPropagation()}
                      className="cursor-pointer accent-red-500" />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{s.full_name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300
                      px-2 py-0.5 rounded text-xs font-medium">
                      {s.roll_number}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{s.department_name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">Sem {s.semester}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{s.batch_year}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{s.email}</td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">
            No students match the selected filters.
          </div>
        )}
      </motion.div>
    </div>
  )
}