// src/layouts/TeacherLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar, PageArea } from './shared'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, BookOpen, ClipboardList, Star, LogOut } from 'lucide-react'

const NAV = [
  { to: '/teacher/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/teacher/classes',    label: 'My Classes', icon: BookOpen },
  { to: '/teacher/attendance', label: 'Attendance', icon: ClipboardList },
  { to: '/teacher/grades',     label: 'Grades',     icon: Star },
]
const ACCENT = '#0d9488'

export default function TeacherLayout() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar accent={ACCENT} user={user} role="Teacher"
        nav={NAV} onLogout={async () => { await logout(); navigate('/login') }} />
      <PageArea location={location} />
    </div>
  )
}