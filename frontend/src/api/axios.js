// src/api/axios.js
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// Attach token to every request automatically
// So you never manually add Authorization header in every component
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If token expires (401), redirect to login automatically
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API