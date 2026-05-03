import { motion } from 'framer-motion'

export default function Button({ children, onClick, variant = 'primary', size = 'md',
  disabled = false, className = '', type = 'button', color = '#7c3aed' }) {

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  }

  const variants = {
    primary: { backgroundColor: color, color: '#fff', border: 'none' },
    outline: { backgroundColor: 'transparent', color: color, border: `1.5px solid ${color}` },
    ghost:   { backgroundColor: 'transparent', color: color, border: 'none' },
    danger:  { backgroundColor: '#dc2626', color: '#fff', border: 'none' },
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled  ? { scale: 0.97 } : {}}
      className={`rounded-lg font-medium transition-opacity inline-flex items-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
      style={variants[variant]}
    >
      {children}
    </motion.button>
  )
}