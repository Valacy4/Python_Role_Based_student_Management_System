// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// allowedRoles = array of roles that can access this route
// e.g. <ProtectedRoute allowedRoles={['teacher', 'hod']}>

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  // Still checking localStorage — don't redirect yet
  if (loading) {
    return <div>Loading...</div>
  }

  // Not logged in at all → go to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → go to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardRoutes = {
      principal: '/principal/dashboard',
      hod:       '/hod/dashboard',
      teacher:   '/teacher/dashboard',
      student:   '/student/dashboard',
    }
    return <Navigate to={dashboardRoutes[user.role]} replace />
  }

  // All checks passed — render the page
  return children
}