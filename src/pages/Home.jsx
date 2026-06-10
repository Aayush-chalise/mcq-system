import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to MCQ System
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            A comprehensive platform for managing and taking MCQ-based exams with detailed result analysis.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/questions">
              <Button variant="secondary" size="lg" className="bg-white hover:bg-gray-100 text-blue-600">
                Explore Questions
              </Button>
            </Link>
            <Link to="/exams">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Browse Exams
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white text-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-4">Question Bank</h3>
              <p className="text-gray-600">
                Access a comprehensive question bank with advanced search and filtering by subject and difficulty level.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">🧪</div>
              <h3 className="text-2xl font-bold mb-4">Exam System</h3>
              <p className="text-gray-600">
                Take timed exams with interactive question navigation, real-time answer tracking, and instant feedback.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-4">Detailed Results</h3>
              <p className="text-gray-600">
                Review detailed result analytics with explanations, score breakdown, and performance insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Choose from our collection of exams and test your knowledge today!
          </p>
          <Link to="/exams">
            <Button variant="secondary" size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
              View All Exams
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
