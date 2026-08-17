export function ProgressBar({ percentual }: { percentual: number }) {
  const p = Math.min(100, Math.max(0, percentual))
  return (
    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
        style={{ width: `${p}%` }}
      />
    </div>
  )
}
