import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Header() {
  const { user, isAdmin, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setMobileMenuOpen(false)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      alert('Erro ao fazer logout')
    }
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link 
            to="/" 
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            onClick={closeMobileMenu}
          >
            Meu Site
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Início
            </Link>

            <Link 
              to="/blog" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Blog
            </Link>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Área Restrita
                </Link>

                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-purple-600 hover:text-purple-700 transition-colors font-semibold"
                  >
                    ⚙️ Admin
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Entrar
              </Link>
            )}
          </nav>

          {/* BOTÃO HAMBURGER (MOBILE) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* MENU MOBILE */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                Início
              </Link>

              <Link 
                to="/blog" 
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                Blog
              </Link>

              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                  >
                    Área Restrita
                  </Link>

                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={closeMobileMenu}
                      className="text-purple-600 hover:text-purple-700 transition-colors font-semibold py-2"
                    >
                      ⚙️ Admin
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-left"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={closeMobileMenu}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center"
                >
                  Entrar
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}