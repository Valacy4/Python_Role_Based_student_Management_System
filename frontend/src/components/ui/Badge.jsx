export default function Badge({ label, color, bg }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color, backgroundColor: bg }}>
      {label}
    </span>
  )
}