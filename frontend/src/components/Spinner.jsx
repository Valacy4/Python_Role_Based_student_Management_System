// src/components/Spinner.jsx
export default function Spinner({ text = 'Loading...' }) {
  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <span style={styles.text}>{text}</span>
    </div>
  )
}

const styles = {
  container: { display: 'flex', alignItems: 'center', gap: '12px', padding: '32px' },
  spinner:   {
    width: '20px', height: '20px', borderRadius: '50%',
    border: '3px solid #e2e8f0', borderTopColor: '#4f46e5',
    animation: 'spin 0.8s linear infinite',
  },
  text: { color: '#64748b', fontSize: '14px' },
}

// Inject keyframes once
const styleTag = document.createElement('style')
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
document.head.appendChild(styleTag)