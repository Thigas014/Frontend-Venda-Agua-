import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { login as loginApi } from '../api/services'
import type { Perfil } from '../types'

interface UsuarioLogado {
  id: number
  nome: string
  email: string
  perfil: Perfil
}

interface AuthContextValue {
  usuario: UsuarioLogado | null
  isAdmin: boolean
  carregando: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const salvo = localStorage.getItem('usuario')
    const token = localStorage.getItem('token')
    if (salvo && token) {
      setUsuario(JSON.parse(salvo))
    }
    setCarregando(false)
  }, [])

  async function login(email: string, senha: string) {
    const resposta = await loginApi(email, senha)
    const usuarioLogado: UsuarioLogado = {
      id: resposta.id,
      nome: resposta.nome,
      email: resposta.email,
      perfil: resposta.perfil as Perfil
    }
    localStorage.setItem('token', resposta.token)
    localStorage.setItem('usuario', JSON.stringify(usuarioLogado))
    setUsuario(usuarioLogado)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, isAdmin: usuario?.perfil === 'ADMIN', carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
