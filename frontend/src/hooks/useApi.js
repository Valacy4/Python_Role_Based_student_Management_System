// src/hooks/useApi.js
import { useState, useEffect } from 'react'
import API from '../api/axios'

export default function useApi(url) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!url) return
    setLoading(true)
    setError('')
    API.get(url)
      .then(res => setData(res.data))
      .catch(err => {
        if (err.response?.status === 403) {
          setError('You do not have permission to view this.')
        } else if (err.response?.status === 404) {
          setError('Resource not found.')
        } else {
          setError('Something went wrong. Please try again.')
        }
      })
      .finally(() => setLoading(false))
  }, [url])

  return { data, loading, error }
}