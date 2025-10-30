import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <a href="/" className="text-blue-500 hover:underline">Voltar para Home</a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}