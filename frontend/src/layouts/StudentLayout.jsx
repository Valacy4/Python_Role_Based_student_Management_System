// src/layouts/StudentLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar, PageArea } from './shared'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, User, ClipboardList, BookMarked, LogOut } from 'lucide-react'

const NAV = [
  { to: '/student/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/student/profile',    label: 'My Profile',  icon: User },
  { to: '/student/attendance', label: 'Attendance',  icon: ClipboardList },
  { to: '/student/marks',      label: 'My Marks',    icon: BookMarked },
]
const ACCENT = '#2563eb'

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar accent={ACCENT} user={user} role="Student"
        nav={NAV} onLogout={async () => { await logout(); navigate('/login') }} />
      <PageArea location={location} />
    </div>
  )
}