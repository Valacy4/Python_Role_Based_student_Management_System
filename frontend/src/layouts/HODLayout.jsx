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

  const isTeachingTab = location.pathname.includes('/hod/my-classes') ||
                        location.pathname.includes('/hod/my-attendance') ||
                        location.pathname.includes('/hod/my-grades')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-amber-900 to-amber-800 text-white shadow-xl">
        <div className="p-6">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center font-bold text-lg">
              H
            </div>
            <h1 className="text-xl font-bold">SMS</h1>
          </div>

          {/* Profile Card */}
          <div className="bg-amber-800 rounded-xl p-4 mb-6 border border-amber-700 hover:border-amber-500 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{user?.full_name}</div>
                <div className="text-xs text-amber-200">HOD + Teacher</div>
              </div>
            </div>
            <div className="text-xs text-amber-200 truncate">{user?.email}</div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 bg-amber-900 rounded-lg p-1">
            <button
              onClick={() => navigate('/hod/dashboard')}
              className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all duration-300 ${
                !isTeachingTab
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-200 hover:bg-amber-800'
              }`}
            >
              Dept
            </button>
            <button
              onClick={() => navigate('/hod/my-classes')}
              className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all duration-300 ${
                isTeachingTab
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-200 hover:bg-amber-800'
              }`}
            >
              Teaching
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider px-3 py-2">Menu</div>

            {/* Department management links */}
            {!isTeachingTab && (
              <>
                <NavLink
                  to="/hod/dashboard"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'text-amber-100 hover:bg-amber-800'
                    }`
                  }
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-4m0 0l4 4m-4-4V5" />
                  </svg>
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/hod/teachers"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'text-amber-100 hover:bg-amber-800'
                    }`
                  }
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Teachers</span>
                </NavLink>
                <NavLink
                  to="/hod/students"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'text-amber-100 hover:bg-amber-800'
                    }`
                  }
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Students</span>
                </NavLink>
              </>
            )}

            {/* Teaching links */}
            {isTeachingTab && (
              <>
                <NavLink
                  to="/hod/my-classes"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'text-amber-100 hover:bg-amber-800'
                    }`
                  }
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17c0 5.523 3.692 10 8 10s8-4.477 8-10c0-6.002-4.5-10.747-10-10.747z" />
                  </svg>
                  <span>My Classes</span>
                </NavLink>
                <NavLink
                  to="/hod/my-attendance"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'text-amber-100 hover:bg-amber-800'
                    }`
                  }
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Attendance</span>
                </NavLink>
                <NavLink
                  to="/hod/my-grades"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'text-amber-100 hover:bg-amber-800'
                    }`
                  }
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Grades</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 mt-auto bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}