// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'

// Create the context
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)   // { id, full_name, email, role }
  const [loading, setLoading] = useState(true)   // true while checking localStorage

  // On app load — check if user was already logged in
  useEffect(() => {
    const token    = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Call Django login endpoint
    const response = await API.post('/auth/login/', { email, password })
    const data = response.data

    // Save tokens to localStorage
    localStorage.setItem('access_token',  data.access)
    localStorage.setItem('refresh_token', data.refresh)

    // Save user info as object
    const userData = {
      id:        data.user_id,
      full_name: data.full_name,
      email:     data.email,
      role:      data.role,
    }
    localStorage.setItem('user_data', JSON.stringify(userData))

    // Update context state
    setUser(userData)

    // Return role so App.jsx can redirect correctly
    return data.role
  }

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await API.post('/auth/logout/', { refresh })
    } catch (e) {
      // Even if logout API fails, clear local data
    }
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this in any component instead of useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext)
}