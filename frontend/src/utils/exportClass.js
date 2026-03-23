// src/utils/exportClass.js
import * as XLSX from 'xlsx'

/**
 * Builds the data rows from enrollments + grades
 * Returns array of objects ready for CSV or Excel
 */
function buildRows(enrollments, grades, subjectName) {
  return enrollments.map(en => {
    // Find grades for this enrollment
    const enGrades = grades.filter(g => g.enrollment === en.id)

    const internal1  = enGrades.find(g => g.exam_type === 'internal1')
    const internal2  = enGrades.find(g => g.exam_type === 'internal2')
    const assignment = enGrades.find(g => g.exam_type === 'assignment')
    const final      = enGrades.find(g => g.exam_type === 'final')

    // Calculate total marks
    const totalMarks = enGrades.reduce((s, g) => s + parseFloat(g.marks    || 0), 0)
    const totalMax   = enGrades.reduce((s, g) => s + parseFloat(g.max_marks || 0), 0)
    const overall    = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(2) : '—'

    return {
      'Student Name':      en.student_name,
      'Roll Number':       en.roll_number,
      'Subject':           subjectName,
      'Internal 1':        internal1  ? `${internal1.marks}/${internal1.max_marks}`   : '—',
      'Internal 2':        internal2  ? `${internal2.marks}/${internal2.max_marks}`   : '—',
      'Assignment':        assignment ? `${assignment.marks}/${assignment.max_marks}` : '—',
      'Final Exam':        final      ? `${final.marks}/${final.max_marks}`           : '—',
      'Total Marks':       totalMax > 0 ? `${totalMarks.toFixed(2)}/${totalMax}`      : '—',
      'Overall %':         overall !== '—' ? `${overall}%`                            : '—',
      'Remarks':           enGrades.map(g => g.remarks).filter(Boolean).join(' | ')   || '—',
    }
  })
}

/**
 * Sanitize filename — replace spaces and special chars
 */
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_')
}

/**
 * Download as CSV
 */
export function downloadCSV(enrollments, grades, subjectName, semester) {
  const rows     = buildRows(enrollments, grades, subjectName)
  const filename = sanitizeFilename(`${subjectName}_Sem${semester}`)

  if (rows.length === 0) {
    alert('No student data to export.')
    return
  }

  const headers = Object.keys(rows[0])
  const csvRows = [
    // File header info
    [`Subject: ${subjectName}`],
    [`Semester: ${semester}`],
    [`Exported on: ${new Date().toLocaleDateString('en-IN')}`],
    [`Total Students: ${rows.length}`],
    [],  // blank row
    headers,
    ...rows.map(row => headers.map(h => row[h]))
  ]

  const csvContent = csvRows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Download as Excel (.xlsx)
 */
export function downloadExcel(enrollments, grades, subjectName, semester) {
  const rows     = buildRows(enrollments, grades, subjectName)
  const filename = sanitizeFilename(`${subjectName}_Sem${semester}`)

  if (rows.length === 0) {
    alert('No student data to export.')
    return
  }

  const workbook  = XLSX.utils.book_new()

  // ── Sheet 1: Student Marks ──────────────────────────────────
  const headers = Object.keys(rows[0])

  // Add metadata rows at top
  const metaRows = [
    ['Subject',         subjectName],
    ['Semester',        `Semester ${semester}`],
    ['Exported on',     new Date().toLocaleDateString('en-IN')],
    ['Total Students',  rows.length],
    [],  // blank row
    headers,
    ...rows.map(row => headers.map(h => row[h]))
  ]

  const sheet1 = XLSX.utils.aoa_to_sheet(metaRows)

  // Set column widths
  sheet1['!cols'] = [
    { wch: 25 },  // Student Name
    { wch: 15 },  // Roll Number
    { wch: 25 },  // Subject
    { wch: 12 },  // Internal 1
    { wch: 12 },  // Internal 2
    { wch: 12 },  // Assignment
    { wch: 12 },  // Final Exam
    { wch: 15 },  // Total Marks
    { wch: 12 },  // Overall %
    { wch: 30 },  // Remarks
  ]

  XLSX.utils.book_append_sheet(workbook, sheet1, 'Student Marks')

  // ── Sheet 2: Summary ─────────────────────────────────────────
  const summaryData = [
    ['SUMMARY'],
    [],
    ['Student Name', 'Roll Number', 'Overall %', 'Result'],
    ...rows.map(row => [
      row['Student Name'],
      row['Roll Number'],
      row['Overall %'],
      row['Overall %'] !== '—'
        ? parseFloat(row['Overall %']) >= 40 ? 'PASS' : 'FAIL'
        : '—'
    ])
  ]

  const sheet2 = XLSX.utils.aoa_to_sheet(summaryData)
  sheet2['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 10 }]

  XLSX.utils.book_append_sheet(workbook, sheet2, 'Summary')

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}