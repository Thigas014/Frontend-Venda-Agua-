import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth({ children, apenasAdmin = false }: { children: ReactNode; apenasAdmin?: boolean }) {
  const { usuario, isAdmin, carregando } = useAuth()

  if (carregando) return null
  if (!usuario) return <Navigate to="/login" replace />
  if (apenasAdmin && !isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}
