import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({
  titulo,
  valor,
  icone,
  corIcone = 'bg-primary-100 text-primary-600'
}: {
  titulo: string
  valor: string
  icone: ReactNode
  corIcone?: string
}) {
  return (
    <Card className="flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${corIcone}`}>
        {icone}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{titulo}</p>
        <p className="text-lg font-bold text-slate-800 truncate">{valor}</p>
      </div>
    </Card>
  )
}
