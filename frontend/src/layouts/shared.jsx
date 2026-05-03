import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Moon, Sun, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

// ── Dark mode hook ────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark'
  )

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return [dark, setDark]
}

// ── Sidebar content (shared between desktop + mobile drawer) ──────
function SidebarContent({ accent, user, role, nav, onLogout, onClose }) {
  const [dark, setDark] = useDarkMode()

  return (
    <div className="flex flex-col h-full">
      {/* Profile */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center
              text-white text-sm font-semibold shrink-0"
            style={{ backgroundColor: accent }}>
            {user?.full_name?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.full_name}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">{role}</div>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700
              dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
            <X size={16} />
          </motion.button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onClose}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={isActive
                  ? { backgroundColor: accent, color: '#fff' }
                  : { color: '#64748b' }}>
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 space-y-1 border-t border-gray-100 dark:border-gray-800">
        {/* Dark mode toggle */}
        <motion.button
          whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
          onClick={() => setDark(d => !d)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
            text-gray-400 dark:text-gray-500
            hover:text-gray-700 dark:hover:text-gray-200
            hover:bg-gray-50 dark:hover:bg-gray-800
            transition-colors w-full">
          <motion.div
            initial={false}
            animate={{ rotate: dark ? 180 : 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}>
            {dark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
          </motion.div>
          {dark ? 'Light mode' : 'Dark mode'}
        </motion.button>

        {/* Logout */}
        <motion.button
          whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
            text-gray-400 hover:text-red-600 dark:hover:text-red-400
            hover:bg-red-50 dark:hover:bg-red-950
            transition-colors w-full">
          <LogOut size={16} strokeWidth={1.5} />
          Logout
        </motion.button>
      </div>
    </div>
  )
}

// ── Main exported Sidebar ─────────────────────────────────────────
export function Sidebar({ accent, user, role, nav, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change
  const location = useLocation()
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex w-56 bg-white dark:bg-gray-900
          border-r border-gray-100 dark:border-gray-800 flex-col shrink-0">
        <SidebarContent
          accent={accent} user={user} role={role}
          nav={nav} onLogout={onLogout} />
      </motion.aside>

      {/* Mobile hamburger button */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden p-2.5 rounded-xl bg-white
          dark:bg-gray-900 border border-gray-200 dark:border-gray-700
          text-gray-600 dark:text-gray-300 shadow-sm">
        <Menu size={18} />
      </motion.button>

      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-sm" />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900
              border-r border-gray-100 dark:border-gray-800 flex flex-col md:hidden">
            <SidebarContent
              accent={accent} user={user} role={role}
              nav={nav} onLogout={onLogout}
              onClose={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Page area with verified AnimatePresence transition ────────────
export function PageArea() {
  const location = useLocation()

  return (
    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="p-6 md:p-8 max-w-6xl mx-auto pt-16 md:pt-8">
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </main>
  )
}