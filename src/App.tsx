import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import { Navbar } from './components/Navbar'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Presenca } from './pages/Presenca'
import { Calendario } from './pages/Calendario'
import { Historico } from './pages/Historico'
import { Admin } from './pages/Admin'

function Layout({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth()
  return (
    <div className="min-h-screen flex flex-col">
      {usuario && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  )
}

function AppRoutes() {
  const { usuario } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/presenca" element={<RequireAuth><Presenca /></RequireAuth>} />
      <Route path="/calendario" element={<RequireAuth><Calendario /></RequireAuth>} />
      <Route path="/historico" element={<RequireAuth><Historico /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth apenasAdmin><Admin /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}
 