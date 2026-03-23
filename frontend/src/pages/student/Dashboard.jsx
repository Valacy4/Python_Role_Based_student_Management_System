// src/pages/student/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'

export default function StudentDashboard() {
  const { user }                      = useAuth()
  const navigate                      = useNavigate()
  const [enrollments,  setEnrollments]  = useState([])
  const [attendance,   setAttendance]   = useState([])
  const [grades,       setGrades]       = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/enrollments/'),
      API.get('/attendance/'),
      API.get('/grades/'),
    ]).then(([enrRes, attRes, grRes]) => {
      setEnrollments(enrRes.data)
      setAttendance(attRes.data)
      setGrades(grRes.data)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{padding:'32px', color:'#64748b'}}>Loading...</p>

  // ── Attendance stats ──────────────────────────────────────────
  const totalAtt    = attendance.length
  const presentAtt  = attendance.filter(a => a.status === 'present').length
  const absentAtt   = attendance.filter(a => a.status === 'absent').length
  const lateAtt     = attendance.filter(a => a.status === 'late').length
  const attPct      = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0

  // ── Attendance per subject ────────────────────────────────────
  const attBySubject = attendance.reduce((acc, a) => {
    const subj = a.subject_name
    if (!acc[subj]) acc[subj] = { present: 0, absent: 0, late: 0, total: 0 }
    acc[subj][a.status]++
    acc[subj].total++
    return acc
  }, {})

  // ── Grades stats ──────────────────────────────────────────────
  const gradesBySubject = grades.reduce((acc, g) => {
    const subj = g.subject_name
    if (!acc[subj]) acc[subj] = []
    acc[subj].push(g)
    return acc
  }, {})

  const subjectAvgs = Object.entries(gradesBySubject).map(([subj, gs]) => {
    const total    = gs.reduce((s, g) => s + parseFloat(g.marks), 0)
    const maxTotal = gs.reduce((s, g) => s + parseFloat(g.max_marks), 0)
    const pct      = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0
    return { subject: subj, percentage: pct, grades: gs }
  })

  const overallGradePct = subjectAvgs.length > 0
    ? Math.round(subjectAvgs.reduce((s, sg) => s + sg.percentage, 0) / subjectAvgs.length)
    : 0

  // ── Color helpers ─────────────────────────────────────────────
  const attColor  = attPct >= 75 ? '#16a34a' : attPct >= 50 ? '#d97706' : '#dc2626'
  const gradeColor = overallGradePct >= 75 ? '#16a34a' : overallGradePct >= 50 ? '#d97706' : '#dc2626'

  return (
    <div>
      {/* Welcome header */}
      <div style={styles.welcomeRow}>
        <div>
          <h2 style={styles.heading}>Welcome back, {user?.full_name}!</h2>
          <p style={styles.sub}>Here's your academic overview</p>
        </div>
        <div style={styles.avatarLarge}>
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div style={styles.statGrid}>
        <StatCard
          label="Enrolled Subjects"
          value={enrollments.length}
          color="#2563eb"
          bg="#eff6ff"
          icon="📚"
        />
        <StatCard
          label="Overall Attendance"
          value={`${attPct}%`}
          color={attColor}
          bg={attPct >= 75 ? '#f0fdf4' : attPct >= 50 ? '#fffbeb' : '#fef2f2'}
          icon="📅"
          sub={`${presentAtt} present / ${totalAtt} classes`}
        />
        <StatCard
          label="Overall Grade"
          value={`${overallGradePct}%`}
          color={gradeColor}
          bg={overallGradePct >= 75 ? '#f0fdf4' : overallGradePct >= 50 ? '#fffbeb' : '#fef2f2'}
          icon="🎯"
          sub={`Across ${subjectAvgs.length} subjects`}
        />
        <StatCard
          label="Classes Attended"
          value={presentAtt}
          color="#7c3aed"
          bg="#f5f3ff"
          icon="✓"
          sub={`${absentAtt} absent, ${lateAtt} late`}
        />
      </div>

      <div style={styles.chartsRow}>
        {/* ── Attendance donut chart ──────────────────────── */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Attendance breakdown</div>
          <DonutChart
            present={presentAtt}
            absent={absentAtt}
            late={lateAtt}
            total={totalAtt}
            pct={attPct}
            color={attColor}
          />
          <div style={styles.donutLegend}>
            <LegendDot color="#16a34a" label={`Present (${presentAtt})`} />
            <LegendDot color="#dc2626" label={`Absent (${absentAtt})`} />
            <LegendDot color="#d97706" label={`Late (${lateAtt})`} />
          </div>
        </div>

        {/* ── Grades bar chart ────────────────────────────── */}
        <div style={{...styles.chartCard, flex: 2}}>
          <div style={styles.chartTitle}>Grade percentage by subject</div>
          {subjectAvgs.length > 0 ? (
            <div style={styles.barChart}>
              {subjectAvgs.map((sg, idx) => (
                <div key={idx} style={styles.barRow}>
                  <div style={styles.barLabel} title={sg.subject}>
                    {sg.subject.length > 20 ? sg.subject.substring(0, 18) + '…' : sg.subject}
                  </div>
                  <div style={styles.barTrack}>
                    <div style={{
                      ...styles.barFill,
                      width: `${sg.percentage}%`,
                      backgroundColor:
                        sg.percentage >= 75 ? '#16a34a' :
                        sg.percentage >= 50 ? '#d97706' : '#dc2626',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                  <div style={{
                    ...styles.barPct,
                    color: sg.percentage >= 75 ? '#16a34a' :
                           sg.percentage >= 50 ? '#d97706' : '#dc2626',
                  }}>
                    {sg.percentage}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{color:'#94a3b8', fontSize:'14px', padding:'20px 0'}}>
              No grades recorded yet.
            </p>
          )}
        </div>
      </div>

      {/* ── Attendance per subject bars ─────────────────── */}
      {Object.keys(attBySubject).length > 0 && (
        <div style={styles.sectionCard}>
          <div style={styles.chartTitle}>Attendance per subject</div>
          <div style={styles.attSubjectGrid}>
            {Object.entries(attBySubject).map(([subj, data]) => {
              const pct = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
              const col = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'
              const bg  = pct >= 75 ? '#f0fdf4' : pct >= 50 ? '#fffbeb' : '#fef2f2'
              return (
                <div key={subj} style={{...styles.attSubjCard, backgroundColor: bg}}>
                  <div style={{...styles.attSubjPct, color: col}}>{pct}%</div>
                  <div style={styles.attSubjName}>{subj}</div>
                  <div style={styles.attSubjBar}>
                    <div style={{
                      ...styles.attSubjFill,
                      width: `${pct}%`,
                      backgroundColor: col,
                    }} />
                  </div>
                  <div style={styles.attSubjMeta}>
                    <span style={{color:'#16a34a'}}>{data.present}P</span>
                    {' · '}
                    <span style={{color:'#dc2626'}}>{data.absent}A</span>
                    {' · '}
                    <span style={{color:'#d97706'}}>{data.late}L</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Enrolled subjects ───────────────────────────── */}
      <div style={styles.sectionCard}>
        <div style={styles.chartTitle}>My enrolled subjects</div>
        <div style={styles.enrollGrid}>
          {enrollments.map(en => {
            const subjName = en.class_name.split(' - ')[1]?.split(' | ')[0] || en.class_name
            const subjCode = en.class_name.split(' - ')[0]
            return (
              <div
                key={en.id}
                style={styles.enrollCard}
                onClick={() => navigate('/student/attendance')}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <div style={styles.enrollCode}>{subjCode}</div>
                <div style={styles.enrollName}>{subjName}</div>
                <div style={styles.enrollDate}>
                  Enrolled {new Date(en.enrolled_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </div>
              </div>
            )
          })}
          {enrollments.length === 0 && (
            <p style={{color:'#64748b'}}>You are not enrolled in any subjects yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Stat card component ───────────────────────────────────────────
function StatCard({ label, value, color, bg, icon, sub }) {
  return (
    <div style={{...cardStyles.card, backgroundColor: bg}}>
      <div style={cardStyles.top}>
        <div style={{...cardStyles.value, color}}>{value}</div>
        <span style={cardStyles.icon}>{icon}</span>
      </div>
      <div style={{...cardStyles.label, color}}>{label}</div>
      {sub && <div style={cardStyles.sub}>{sub}</div>}
    </div>
  )
}

const cardStyles = {
  card:  { padding:'20px', borderRadius:'12px', flex:1 },
  top:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' },
  value: { fontSize:'32px', fontWeight:'700' },
  icon:  { fontSize:'22px' },
  label: { fontSize:'13px', fontWeight:'600' },
  sub:   { fontSize:'12px', color:'#94a3b8', marginTop:'4px' },
}

// ── Donut chart (pure SVG) ────────────────────────────────────────
function DonutChart({ present, absent, late, total, pct, color }) {
  if (total === 0) return <p style={{color:'#94a3b8', fontSize:'14px', textAlign:'center', padding:'20px'}}>No attendance data</p>

  const r    = 60
  const cx   = 80
  const cy   = 80
  const circ = 2 * Math.PI * r

  const presentDash = (present / total) * circ
  const absentDash  = (absent  / total) * circ
  const lateDash    = (late    / total) * circ

  const presentOffset = 0
  const absentOffset  = -presentDash
  const lateOffset    = -(presentDash + absentDash)

  return (
    <div style={{display:'flex', justifyContent:'center', margin:'12px 0'}}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18"/>

        {/* Present */}
        {present > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16a34a" strokeWidth="18"
            strokeDasharray={`${presentDash} ${circ - presentDash}`}
            strokeDashoffset={presentOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
        {/* Absent */}
        {absent > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#dc2626" strokeWidth="18"
            strokeDasharray={`${absentDash} ${circ - absentDash}`}
            strokeDashoffset={absentOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
        {/* Late */}
        {late > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d97706" strokeWidth="18"
            strokeDasharray={`${lateDash} ${circ - lateDash}`}
            strokeDashoffset={lateOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}

        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle"
          style={{fontSize:'22px', fontWeight:'700', fill: color}}>
          {pct}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle"
          style={{fontSize:'11px', fill:'#94a3b8'}}>
          attendance
        </text>
      </svg>
    </div>
  )
}

// ── Legend dot ────────────────────────────────────────────────────
function LegendDot({ color, label }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'#64748b'}}>
      <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor: color}} />
      {label}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────
const styles = {
  welcomeRow:     { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  heading:        { fontSize:'22px', fontWeight:'600', color:'#0f172a', marginBottom:'4px' },
  sub:            { color:'#64748b', fontSize:'14px' },
  avatarLarge:    { width:'52px', height:'52px', borderRadius:'50%', backgroundColor:'#2563eb',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'#fff', fontSize:'22px', fontWeight:'700' },
  statGrid:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'20px' },
  chartsRow:      { display:'flex', gap:'16px', marginBottom:'20px' },
  chartCard:      { backgroundColor:'#fff', padding:'20px', borderRadius:'12px',
                    border:'1px solid #e2e8f0', flex:1 },
  chartTitle:     { fontSize:'14px', fontWeight:'600', color:'#0f172a', marginBottom:'16px' },
  donutLegend:    { display:'flex', justifyContent:'center', gap:'16px', marginTop:'8px', flexWrap:'wrap' },
  barChart:       { display:'flex', flexDirection:'column', gap:'12px' },
  barRow:         { display:'flex', alignItems:'center', gap:'10px' },
  barLabel:       { width:'140px', fontSize:'12px', color:'#64748b', flexShrink:0,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  barTrack:       { flex:1, height:'10px', backgroundColor:'#f1f5f9', borderRadius:'5px', overflow:'hidden' },
  barFill:        { height:'100%', borderRadius:'5px', minWidth:'2px' },
  barPct:         { width:'40px', fontSize:'12px', fontWeight:'600', textAlign:'right', flexShrink:0 },
  sectionCard:    { backgroundColor:'#fff', padding:'20px', borderRadius:'12px',
                    border:'1px solid #e2e8f0', marginBottom:'20px' },
  attSubjectGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:'12px' },
  attSubjCard:    { padding:'14px', borderRadius:'10px', textAlign:'center' },
  attSubjPct:     { fontSize:'26px', fontWeight:'700', marginBottom:'4px' },
  attSubjName:    { fontSize:'12px', color:'#374151', fontWeight:'500', marginBottom:'8px',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  attSubjBar:     { height:'6px', backgroundColor:'rgba(0,0,0,0.08)', borderRadius:'3px',
                    overflow:'hidden', marginBottom:'6px' },
  attSubjFill:    { height:'100%', borderRadius:'3px', transition:'width 0.8s ease' },
  attSubjMeta:    { fontSize:'11px', color:'#94a3b8' },
  enrollGrid:     { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'12px' },
  enrollCard:     { padding:'16px', borderRadius:'10px', border:'1px solid #e2e8f0',
                    backgroundColor:'#fafafa', cursor:'pointer', transition:'border-color 0.15s' },
  enrollCode:     { fontSize:'12px', color:'#2563eb', fontWeight:'700', marginBottom:'4px' },
  enrollName:     { fontSize:'14px', fontWeight:'600', color:'#0f172a', marginBottom:'6px' },
  enrollDate:     { fontSize:'12px', color:'#94a3b8' },
}
