// src/layouts/HODLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HODLayout() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Determine which top tab is active
  const isTeachingTab = location.pathname.includes('/hod/my-classes') ||
                        location.pathname.includes('/hod/my-attendance') ||
                        location.pathname.includes('/hod/my-grades')

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.profile}>
          <div style={{ ...styles.avatar, backgroundColor: '#d97706' }}>H</div>
          <div>
            <div style={styles.name}>{user?.full_name}</div>
            <div style={styles.role}>HOD + Teacher</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={styles.tabRow}>
          <button
            onClick={() => navigate('/hod/dashboard')}
            style={{ ...styles.tab, ...((!isTeachingTab) ? styles.tabActive : {}) }}
          >
            Dept
          </button>
          <button
            onClick={() => navigate('/hod/my-classes')}
            style={{ ...styles.tab, ...(isTeachingTab ? styles.tabActive : {}) }}
          >
            Teaching
          </button>
        </div>

        <nav>
          {/* Department management links */}
          {!isTeachingTab && (
            <>
              <NavLink to="/hod/dashboard"  style={navStyle}>Dashboard</NavLink>
              <NavLink to="/hod/teachers"   style={navStyle}>Teachers</NavLink>
              <NavLink to="/hod/students"   style={navStyle}>Students</NavLink>
            </>
          )}

          {/* Teaching links */}
          {isTeachingTab && (
            <>
              <NavLink to="/hod/my-classes"    style={navStyle}>My Classes</NavLink>
              <NavLink to="/hod/my-attendance" style={navStyle}>Attendance</NavLink>
              <NavLink to="/hod/my-grades"     style={navStyle}>Grades</NavLink>
            </>
          )}
        </nav>

        <button onClick={handleLogout} style={styles.logout}>Logout</button>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const navStyle = ({ isActive }) => ({
  display: 'block', padding: '10px 16px', marginBottom: '4px',
  borderRadius: '6px', textDecoration: 'none',
  color:           isActive ? '#fff' : '#cbd5e1',
  backgroundColor: isActive ? '#d97706' : 'transparent',
  fontWeight:      isActive ? '500' : '400',
})

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  sidebar:   { width: '220px', backgroundColor: '#1e293b', padding: '24px 16px',
               display: 'flex', flexDirection: 'column', gap: '8px' },
  profile:   { display: 'flex', alignItems: 'center', gap: '12px',
               marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #334155' },
  avatar:    { width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
               alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600' },
  name:      { color: '#f1f5f9', fontSize: '14px', fontWeight: '500' },
  role:      { color: '#94a3b8', fontSize: '11px' },
  tabRow:    { display: 'flex', gap: '6px', marginBottom: '12px' },
  tab:       { flex: 1, padding: '6px', backgroundColor: '#334155', color: '#94a3b8',
               border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  tabActive: { backgroundColor: '#d97706', color: '#fff', fontWeight: '500' },
  main:      { flex: 1, padding: '32px', backgroundColor: '#f8fafc' },
  logout:    { marginTop: 'auto', padding: '10px', backgroundColor: '#dc2626',
               color: '#fff', border: 'none', borderRadius: '6px',
               cursor: 'pointer', fontWeight: '500' },
}