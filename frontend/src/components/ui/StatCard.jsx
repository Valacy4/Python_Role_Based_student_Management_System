import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function StatCard({ label, value, color, bg, icon: Icon, sub, delay = 0, suffix = '' }) {
  const [count, setCount] = useState(0)
  const isNumber = typeof value === 'number'

  useEffect(() => {
    if (!isNumber) return
    let start = 0
    const end = value
    const duration = 800
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl p-5 flex flex-col gap-2 dark:bg-gray-800"
      style={{ backgroundColor: bg }}
    >
      <div className="flex justify-between items-start">
        <span className="text-3xl font-bold" style={{ color }}>
          {isNumber ? count : value}{suffix}
        </span>
        {Icon && <Icon size={22} color={color} strokeWidth={1.5} />}
      </div>
      <div className="text-sm font-medium" style={{ color }}>{label}</div>
      {sub && <div className="text-xs text-gray-400 dark:text-gray-500">{sub}</div>}
    </motion.div>
  )
}