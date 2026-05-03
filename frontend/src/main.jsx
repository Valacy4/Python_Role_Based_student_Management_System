import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '10px',
          padding: '10px 16px',
        },
        success: {
          style: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
          iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
        },
        error: {
          style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
          iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
        },
        loading: {
          style: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' },
        },
      }}
    />
  </React.StrictMode>
)