// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateLogin } from '../utils/validate'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading,  setLoading]  = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    // Validate before sending to API
    const validationErrors = validateLogin({ email, password })
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const role = await login(email, password)
      const routes = {
        principal: '/principal/dashboard',
        hod:       '/hod/dashboard',
        teacher:   '/teacher/dashboard',
        student:   '/student/dashboard',
      }
      navigate(routes[role] || '/login')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Student Management System</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {apiError && <div style={styles.apiError}>{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})) }}
              style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
              placeholder="you@sms.com"
            />
            {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})) }}
              style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
              placeholder="••••••••"
            />
            {errors.password && <span style={styles.fieldError}>{errors.password}</span>}
          </div>

          <button type="submit" style={{ ...styles.button,
            opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
          }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page:       { minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', backgroundColor: '#f1f5f9' },
  card:       { backgroundColor: '#fff', padding: '40px', borderRadius: '12px',
                width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title:      { fontSize: '22px', fontWeight: '600', color: '#0f172a',
                marginBottom: '4px', textAlign: 'center' },
  subtitle:   { color: '#64748b', textAlign: 'center', marginBottom: '28px' },
  apiError:   { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px',
                borderRadius: '6px', marginBottom: '16px', fontSize: '14px',
                border: '1px solid #fecaca' },
  field:      { marginBottom: '16px' },
  label:      { display: 'block', marginBottom: '6px', fontSize: '14px',
                fontWeight: '500', color: '#374151' },
  input:      { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
                outline: 'none' },
  inputError: { borderColor: '#dc2626', backgroundColor: '#fff5f5' },
  fieldError: { display: 'block', color: '#dc2626', fontSize: '12px', marginTop: '4px' },
  button:     { width: '100%', padding: '12px', backgroundColor: '#4f46e5',
                color: '#fff', border: 'none', borderRadius: '6px',
                fontSize: '15px', fontWeight: '500', marginTop: '8px' },
}