// src/layouts/StudentLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.profile}>
          <div style={{...styles.avatar, backgroundColor: '#2563eb'}}>S</div>
          <div>
            <div style={styles.name}>{user?.full_name}</div>
            <div style={styles.role}>Student</div>
          </div>
        </div>
        <nav>
          <NavLink to="/student/dashboard"  style={navStyle}>Dashboard</NavLink>
          <NavLink to="/student/profile"    style={navStyle}>My Profile</NavLink>
          <NavLink to="/student/attendance" style={navStyle}>Attendance</NavLink>
          <NavLink to="/student/marks"      style={navStyle}>My Marks</NavLink>
        </nav>
        <button onClick={handleLogout} style={styles.logout}>Logout</button>
      </aside>
      <main style={styles.main}><Outlet /></main>
    </div>
  )
}

const navStyle = ({ isActive }) => ({
  display: 'block', padding: '10px 16px', marginBottom: '4px',
  borderRadius: '6px', textDecoration: 'none',
  color: isActive ? '#fff' : '#cbd5e1',
  backgroundColor: isActive ? '#2563eb' : 'transparent',
  fontWeight: isActive ? '500' : '400',
})

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  sidebar:   { width: '220px', backgroundColor: '#1e293b', padding: '24px 16px',
               display: 'flex', flexDirection: 'column', gap: '8px' },
  profile:   { display: 'flex', alignItems: 'center', gap: '12px',
               marginBottom: '24px', paddingBottom: '16px',
               borderBottom: '1px solid #334155' },
  avatar:    { width: '40px', height: '40px', borderRadius: '50%',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               color: '#fff', fontWeight: '600' },
  name:      { color: '#f1f5f9', fontSize: '14px', fontWeight: '500' },
  role:      { color: '#94a3b8', fontSize: '12px' },
  main:      { flex: 1, padding: '32px', backgroundColor: '#f8fafc' },
  logout:    { marginTop: 'auto', padding: '10px', backgroundColor: '#dc2626',
               color: '#fff', border: 'none', borderRadius: '6px',
               cursor: 'pointer', fontWeight: '500' },
}