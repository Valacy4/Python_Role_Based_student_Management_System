import { motion } from 'framer-motion'

const pulse = {
  animate: { opacity: [0.5, 1, 0.5] },
  transition: { duration: 1.5, repeat: Infinity }
}

export function SkeletonRow() {
  return (
    <motion.div {...pulse} className="flex gap-4 p-4 border-b border-gray-50">
      <div className="w-8 h-8 bg-gray-100 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </motion.div>
  )
}

export function SkeletonCard() {
  return (
    <motion.div {...pulse} className="rounded-xl p-5 bg-gray-50 space-y-3">
      <div className="h-8 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </motion.div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  )
}