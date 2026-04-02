// src/pages/hod/Students.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'
import AutoSearch from '../../components/AutoSearch'

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
      <div style={styles.topRow}>
        <div>
          <h2 style={styles.heading}>Students in My Department</h2>
          <p style={styles.sub}>Click on a student to view their full details</p>
        </div>
        <AutoSearch
          placeholder="Search by name or roll no..."
          items={students}
          searchKeys={['full_name', 'roll_number']}
          storageKey="hod_students_search"
          onSearch={val => setSearch(val)}
          onSelect={s => setSearch(s.full_name)}
        />
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Roll Number</th>
                <th style={styles.th}>Semester</th>
                <th style={styles.th}>Batch Year</th>
                <th style={styles.th}>Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr
                  key={s.id}
                  style={styles.tr}
                  onClick={() => navigate(`/hod/students/${s.id}`)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    <div style={styles.nameRow}>
                      <div style={styles.avatar}>
                        {s.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={styles.name}>{s.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.rollBadge}>{s.roll_number}</span>
                  </td>
                  <td style={styles.td}>Sem {s.semester}</td>
                  <td style={styles.td}>{s.batch_year}</td>
                  <td style={styles.td}>{s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p style={{color:'#64748b', padding:'16px'}}>No students found.</p>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  topRow:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start',
               marginBottom:'20px', gap:'16px' },
  heading:   { fontSize:'22px', fontWeight:'600', color:'#0f172a', margin:0 },
  sub:       { color:'#64748b', fontSize:'14px', marginTop:'4px' },
  card:      { backgroundColor:'#fff', borderRadius:'10px', border:'1px solid #e2e8f0', overflow:'hidden' },
  table:     { width:'100%', borderCollapse:'collapse' },
  th:        { textAlign:'left', padding:'12px 16px', fontSize:'13px', color:'#64748b',
               borderBottom:'1px solid #f1f5f9', backgroundColor:'#f8fafc' },
  tr:        { cursor:'pointer', transition:'background 0.1s' },
  td:        { padding:'12px 16px', fontSize:'14px', color:'#374151', borderBottom:'1px solid #f8fafc' },
  nameRow:   { display:'flex', alignItems:'center', gap:'10px' },
  avatar:    { width:'32px', height:'32px', borderRadius:'50%', backgroundColor:'#2563eb',
               display:'flex', alignItems:'center', justifyContent:'center',
               color:'#fff', fontWeight:'600', fontSize:'13px', flexShrink:0 },
  name:      { fontWeight:'500', color:'#0f172a' },
  rollBadge: { backgroundColor:'#f1f5f9', color:'#475569', padding:'3px 8px',
               borderRadius:'4px', fontSize:'13px', fontWeight:'500' },
}