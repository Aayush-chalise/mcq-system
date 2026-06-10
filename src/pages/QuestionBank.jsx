import { useState, useEffect } from 'react'
import questionService from '../services/questionService'
import QuestionCard from '../components/QuestionCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

function QuestionBank() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    difficulty: '',
  })

  const subjects = ['Geography', 'Science', 'Literature', 'Mathematics']
  const difficulties = ['easy', 'medium', 'hard']

  useEffect(() => {
    fetchQuestions()
  }, [filters])

  const fetchQuestions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await questionService.getAllQuestions(filters)
      setQuestions(data)
      setCurrentIndex(0)
    } catch (err) {
      setError('Failed to load questions. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Question Bank</h1>

      {error && (
        <ErrorAlert message={error} onClose={() => setError(null)} />
      )}

      {/* Filters */}
      <Card variant="elevated" className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Levels</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ search: '', subject: '', difficulty: '' })}
              variant="secondary"
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner text="Loading questions..." />
      ) : questions.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <p className="text-xl text-gray-600">No questions found matching your criteria.</p>
        </Card>
      ) : (
        <div>
          {/* Question Display */}
          <Card variant="elevated" className="mb-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Question {currentIndex + 1} of {questions.length}</h2>
              </div>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {currentQuestion && (
              <div>
                {/* Question Text */}
                <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                  <p className="text-xl font-semibold text-gray-900">{currentQuestion.text}</p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                    >
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="option" className="mr-3" />
                        <span className="text-lg text-gray-900">{option.text}</span>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                  <h4 className="font-semibold text-green-900 mb-2">Explanation</h4>
                  <p className="text-green-800">{currentQuestion.explanation}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant={currentIndex === 0 ? 'secondary' : 'primary'}
              className="flex-1"
            >
              ← Previous
            </Button>
            <div className="flex items-center justify-center px-6 py-2 bg-white border border-gray-300 rounded-lg">
              <span className="text-gray-700">{currentIndex + 1} / {questions.length}</span>
            </div>
            <Button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              variant={currentIndex === questions.length - 1 ? 'secondary' : 'primary'}
              className="flex-1"
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionBank
