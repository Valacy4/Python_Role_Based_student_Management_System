// src/pages/hod/TeacherDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function TeacherDetail() {
  const { id }                      = useParams()  // teacher profile id
  const navigate                    = useNavigate()
  const [teacher,  setTeacher]      = useState(null)
  const [classes,  setClasses]      = useState([])
  const [loading,  setLoading]      = useState(true)
  const [error,    setError]        = useState('')

  useEffect(() => {
    Promise.all([
      API.get(`/teachers/${id}/`),
      API.get('/classes/'),
    ]).then(([tRes, clsRes]) => {
      setTeacher(tRes.data)
      // Classes taught by this teacher
      setClasses(clsRes.data.filter(c => c.teacher === parseInt(id)))
    }).catch(() => setError('Could not load teacher details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p style={{padding:'32px', color:'#64748b'}}>Loading...</p>
  if (error)   return <p style={{padding:'32px', color:'#dc2626'}}>{error}</p>
  if (!teacher) return <p style={{padding:'32px', color:'#dc2626'}}>Teacher not found.</p>

  return (
    <div>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          {teacher.full_name?.charAt(0).toUpperCase()}
        </div>
        <div style={{flex:1}}>
          <h2 style={styles.heading}>{teacher.full_name}</h2>
          <div style={styles.metaRow}>
            <span style={styles.roleBadge}>Teacher</span>
            <span style={styles.meta}>{teacher.email}</span>
            <span style={styles.meta}>Emp ID: {teacher.employee_id}</span>
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Teacher Profile</div>
        <InfoRow label="Full Name"      value={teacher.full_name} />
        <InfoRow label="Email"          value={teacher.email} />
        <InfoRow label="Employee ID"    value={teacher.employee_id} />
        <InfoRow label="Specialization" value={teacher.specialization || '—'} />
        <InfoRow label="Department"     value={teacher.department_name || teacher.department} />
      </div>

      {/* Classes card */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          Teaching Classes ({classes.length})
        </div>
        {classes.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Academic Year</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls, idx) => (
                <tr key={cls.id}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    <div style={styles.subjectCode}>
                      {cls.subject_name?.split(' - ')[0]}
                    </div>
                    <div style={styles.subjectName}>
                      {cls.subject_name?.split(' - ')[1] || cls.subject_name}
                    </div>
                  </td>
                  <td style={styles.td}>{cls.academic_year}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: cls.is_active ? '#dcfce7' : '#f1f5f9',
                      color:           cls.is_active ? '#16a34a' : '#64748b',
                    }}>
                      {cls.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={styles.empty}>No classes assigned yet.</p>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{display:'flex', padding:'10px 0', borderBottom:'1px solid #f1f5f9'}}>
      <span style={{width:'160px', color:'#64748b', fontSize:'14px'}}>{label}</span>
      <span style={{color:'#0f172a', fontSize:'14px', fontWeight:'500'}}>{value || '—'}</span>
    </div>
  )
}

const styles = {
  backBtn:     { background:'none', border:'1px solid #e2e8f0', borderRadius:'6px',
                 padding:'6px 14px', cursor:'pointer', color:'#64748b',
                 fontSize:'14px', marginBottom:'20px' },
  header:      { display:'flex', alignItems:'center', gap:'16px', backgroundColor:'#fff',
                 padding:'20px 24px', borderRadius:'12px', border:'1px solid #e2e8f0',
                 marginBottom:'16px' },
  avatar:      { width:'52px', height:'52px', borderRadius:'50%', backgroundColor:'#0d9488',
                 display:'flex', alignItems:'center', justifyContent:'center',
                 color:'#fff', fontSize:'22px', fontWeight:'700', flexShrink:0 },
  heading:     { fontSize:'20px', fontWeight:'600', color:'#0f172a', margin:'0 0 8px 0' },
  metaRow:     { display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' },
  roleBadge:   { backgroundColor:'#0d9488', color:'#fff', padding:'3px 10px',
                 borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
  meta:        { fontSize:'13px', color:'#64748b' },
  card:        { backgroundColor:'#fff', padding:'20px', borderRadius:'12px',
                 border:'1px solid #e2e8f0', marginBottom:'16px' },
  cardTitle:   { fontSize:'13px', fontWeight:'600', color:'#94a3b8', textTransform:'uppercase',
                 letterSpacing:'0.05em', marginBottom:'16px' },
  table:       { width:'100%', borderCollapse:'collapse' },
  th:          { textAlign:'left', padding:'10px 14px', fontSize:'13px', color:'#64748b',
                 backgroundColor:'#f8fafc', borderBottom:'1px solid #f1f5f9' },
  td:          { padding:'10px 14px', fontSize:'14px', color:'#374151',
                 borderBottom:'1px solid #f8fafc' },
  subjectCode: { fontSize:'12px', color:'#d97706', fontWeight:'600' },
  subjectName: { fontSize:'14px', color:'#0f172a', fontWeight:'500' },
  statusBadge: { padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
  empty:       { color:'#94a3b8', fontSize:'14px', padding:'8px 0' },
}