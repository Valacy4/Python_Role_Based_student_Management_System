import { motion } from 'framer-motion'

export default function Table({ columns, rows, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            {columns.map(col => (
              <th key={col.key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <motion.tr
              key={row.id ?? idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              // ✅ FIX: removed whileHover={{ backgroundColor }} — Framer Motion
              // applies hover via inline style which shares the same `transition`
              // as the entrance animation, making hover color respond with a delay
              // on later rows (idx * 0.03 bleeds into hover timing).
              // CSS hover classes are instant and don't conflict with FM transitions.
              onClick={() => onRowClick?.(row)}
              className={`border-b border-gray-50 dark:border-gray-800
                transition-colors duration-150
                hover:bg-slate-50 dark:hover:bg-gray-800
                ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}