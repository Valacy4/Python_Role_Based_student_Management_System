// src/layouts/PrincipalLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Sidebar, PageArea } from './shared'
import { LayoutDashboard, Users, Building2, Trash2, LogOut } from 'lucide-react'

const NAV = [
  { to: '/principal/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/principal/users',        label: 'All Users',    icon: Users },
  { to: '/principal/departments',  label: 'Departments',  icon: Building2 },
  { to: '/principal/delete-batch', label: 'Delete Batch', icon: Trash2 },
]
const ACCENT = '#7c3aed'

export default function PrincipalLayout() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar accent={ACCENT} user={user} role="Principal"
        nav={NAV} onLogout={async () => { await logout(); navigate('/login') }} />
      <PageArea location={location} />
    </div>
  )
}