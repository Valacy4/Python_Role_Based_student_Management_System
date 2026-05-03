import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'No data', subtitle = '', action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Inbox size={24} className="text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  )
}