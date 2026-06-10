import { Link, useLocation } from 'react-router-dom'
import { SignInButton, SignUpButton, UserButton, useUser, SignOutButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

function Navbar() {
  const { isSignedIn, user } = useUser()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const isAdmin = user?.publicMetadata?.role === 'admin'

  const links = [
    { path: '/', label: 'Home', requireAuth: false },
    { path: '/question-bank', label: 'Question Bank', requireAuth: true },
    { path: '/exams', label: 'Exams', requireAuth: true },
    { path: '/results', label: 'Results', requireAuth: true },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin Panel', requireAuth: true }] : []),
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-primary/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-accent">
            <span>📚</span>
            <span>MCQ</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              if (!isSignedIn && link.requireAuth) return null
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'bg-accent text-primary'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-10 w-10',
                  },
                }}
              />
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-white hover:text-accent transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-accent text-primary rounded-lg hover:bg-secondary transition-all font-medium">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 space-y-2 border-t border-white/10"
          >
            {links.map((link) => {
              if (!isSignedIn && link.requireAuth) return null
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-all ${
                    location.pathname === link.path
                      ? 'bg-accent text-primary font-medium'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            {isSignedIn ? (
              <div className="px-4 py-2 border-t border-white/10 mt-2 pt-2">
                <UserButton />
              </div>
            ) : (
              <div className="px-4 py-2 border-t border-white/10 mt-2 pt-2 space-y-2">
                <SignInButton mode="modal">
                  <button className="w-full px-4 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full px-4 py-2 bg-accent text-primary rounded-lg hover:bg-secondary transition-all font-medium">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
