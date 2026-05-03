// src/pages/Login.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, Sun, Moon, ArrowRight } from 'lucide-react'

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

const ROLE_HINTS = [
  { role: 'Principal', email: 'principal@sms.com', color: '#7c3aed' },
  { role: 'HOD',       email: 'hod_cs@sms.com',   color: '#d97706' },
  { role: 'Teacher',   email: 'teacher_cs_1@sms.com', color: '#0d9488' },
  { role: 'Student',   email: 'student_cs2022001@sms.com', color: '#2563eb' },
]

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [focused,  setFocused]  = useState(null)
  const [dark, setDark]         = useDarkMode()
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const role = await login(email, password)
      toast.success(`Welcome back!`)
      const routes = {
        principal: '/principal/dashboard',
        hod:       '/hod/dashboard',
        teacher:   '/teacher/dashboard',
        student:   '/student/dashboard',
      }
      navigate(routes[role])
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-gray-950' : 'bg-slate-50'} transition-colors duration-500`}>

      {/* ── Left panel — decorative ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden
          ${dark ? 'bg-gray-900' : 'bg-indigo-600'}`}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large blurred circle top-right */}
          <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30
            ${dark ? 'bg-indigo-500' : 'bg-indigo-400'}`} />
          {/* Small circle bottom-left */}
          <div className={`absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-2xl opacity-20
            ${dark ? 'bg-purple-400' : 'bg-blue-300'}`} />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">SMS</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Manage your<br />institution<br />with ease.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              One platform for principals, HODs, teachers and students to stay connected and informed.
            </p>
          </motion.div>

          {/* Role cards */}
          <div className="space-y-2.5">
            {ROLE_HINTS.map((r, i) => (
              <motion.div
                key={r.role}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                onClick={() => setEmail(r.email)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                  bg-white/10 hover:bg-white/20 backdrop-blur
                  border border-white/10 cursor-pointer transition-all group"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-white/80 text-xs font-medium">{r.role}</span>
                <span className="text-white/40 text-xs ml-auto group-hover:text-white/60 transition-colors">
                  {r.email}
                </span>
              </motion.div>
            ))}
            <p className="text-white/30 text-xs pl-1 pt-1">↑ Click any role to autofill email</p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs">© 2026 Student Management System</p>
        </div>
      </motion.div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">

        {/* Dark mode toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setDark(d => !d)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`absolute top-6 right-6 p-2.5 rounded-xl border transition-colors
            ${dark
              ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={dark ? 'sun' : 'moon'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>SMS</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-2xl font-bold mb-1.5 ${dark ? 'text-white' : 'text-gray-900'}`}
            >
              Welcome back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Email field */}
            <div>
              <label className={`text-xs font-semibold uppercase tracking-wider block mb-2
                ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className={`absolute left-3.5 top-3.5 transition-colors
                  ${focused === 'email' ? 'text-indigo-500' : dark ? 'text-gray-600' : 'text-gray-400'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="you@sms.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none
                    border-2 transition-all duration-200
                    ${dark
                      ? `bg-gray-800 text-gray-100 placeholder-gray-600
                         ${focused === 'email'
                           ? 'border-indigo-500'
                           : 'border-gray-700 hover:border-gray-600'}`
                      : `bg-white text-gray-900 placeholder-gray-400
                         ${focused === 'email'
                           ? 'border-indigo-500'
                           : 'border-gray-200 hover:border-gray-300'}`
                    }`}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className={`text-xs font-semibold uppercase tracking-wider block mb-2
                ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className={`absolute left-3.5 top-3.5 transition-colors
                  ${focused === 'password' ? 'text-indigo-500' : dark ? 'text-gray-600' : 'text-gray-400'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none
                    border-2 transition-all duration-200
                    ${dark
                      ? `bg-gray-800 text-gray-100 placeholder-gray-600
                         ${focused === 'password'
                           ? 'border-indigo-500'
                           : 'border-gray-700 hover:border-gray-600'}`
                      : `bg-white text-gray-900 placeholder-gray-400
                         ${focused === 'password'
                           ? 'border-indigo-500'
                           : 'border-gray-200 hover:border-gray-300'}`
                    }`}
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full flex items-center justify-center gap-2
                bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                text-white py-3 rounded-xl text-sm font-semibold
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                mt-2 shadow-lg shadow-indigo-500/20"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Signing in...
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    Sign in
                    <ArrowRight size={15} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>

          {/* Mobile role hints */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="lg:hidden mt-8"
          >
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3
              ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
              Quick fill
            </p>
            <div className="flex flex-wrap gap-2">
              {ROLE_HINTS.map(r => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setEmail(r.email)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                    ${dark
                      ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  style={{ borderLeftColor: r.color, borderLeftWidth: 2 }}
                >
                  {r.role}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}