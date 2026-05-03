import { motion } from 'framer-motion'

export default function Card({ children, className = '', delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={onClick ? { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } : {}}
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}