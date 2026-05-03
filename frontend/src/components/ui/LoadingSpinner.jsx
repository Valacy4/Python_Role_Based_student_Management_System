import { motion } from 'framer-motion'

export default function LoadingSpinner({ color = '#7c3aed' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <motion.div
        className="w-8 h-8 rounded-full border-2 border-t-transparent"
        style={{ borderColor: `${color}40`, borderTopColor: color }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}