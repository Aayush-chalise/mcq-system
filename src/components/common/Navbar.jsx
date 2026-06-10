import { Link } from 'react-router-dom'
import { useState } from 'react'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
            <span>📝</span>
            <span>MCQ System</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="hover:text-blue-200 transition duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              to="/questions"
              className="hover:text-blue-200 transition duration-200 font-medium"
            >
              Question Bank
            </Link>
            <Link
              to="/exams"
              className="hover:text-blue-200 transition duration-200 font-medium"
            >
              Exams
            </Link>
            <Link
              to="/results"
              className="hover:text-blue-200 transition duration-200 font-medium"
            >
              Results
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/questions"
              className="block px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setIsOpen(false)}
            >
              Question Bank
            </Link>
            <Link
              to="/exams"
              className="block px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setIsOpen(false)}
            >
              Exams
            </Link>
            <Link
              to="/results"
              className="block px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setIsOpen(false)}
            >
              Results
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
