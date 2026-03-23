// src/components/ErrorBanner.jsx
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div style={styles.banner}>
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={styles.close}>✕</button>
      )}
    </div>
  )
}

const styles = {
  banner: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px 16px',
            borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid #fecaca' },
  close:  { background: 'none', border: 'none', color: '#dc2626',
            cursor: 'pointer', fontSize: '16px', padding: '0 4px' },
}