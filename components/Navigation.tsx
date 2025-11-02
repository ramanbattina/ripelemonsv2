import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, LogOut, LayoutDashboard, Crown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Ripe<span className="text-green-600">Lemons</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Products
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link to="/submit" className="text-gray-600 hover:text-gray-900 transition-colors">
                Submit Product
              </Link>
              
              {user ? (
                <>
                  {profile && profile.subscription_status !== 'free' && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold rounded-full">
                      <Crown size={14} />
                      <span>{profile.subscription_status.toUpperCase()}</span>
                    </div>
                  )}
                  <Link 
                    to="/dashboard" 
                    className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogIn size={18} />
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setIsOpen(false)}
                >
                  Products
                </Link>
                <Link
                  to="/pricing"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setIsOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/submit"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setIsOpen(false)}
                >
                  Submit Product
                </Link>
                
                {user ? (
                  <>
                    {profile && profile.subscription_status !== 'free' && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold rounded-full w-fit">
                        <Crown size={14} />
                        <span>{profile.subscription_status.toUpperCase()}</span>
                      </div>
                    )}
                    <Link
                      to="/dashboard"
                      className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                      className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-left"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        openAuthModal('login')
                        setIsOpen(false)
                      }}
                      className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-left"
                    >
                      <LogIn size={18} />
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal('signup')
                        setIsOpen(false)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-center"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}
