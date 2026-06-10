import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import resultService from '../services/resultService'
import questionService from '../services/questionService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'

function ResultDetails() {
  const { resultId } = useParams()
  const [result, setResult] = useState(null)
  const [questionsDetails, setQuestionsDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchResultDetails()
  }, [resultId])

  const fetchResultDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const resultData = await resultService.getResultById(resultId)
      setResult(resultData)

      // Fetch question details
      const questionDetails = []
      for (const answer of resultData.answers) {
        const question = await questionService.getQuestionById(answer.questionId)
        questionDetails.push({
          ...question,
          userAnswer: answer.selected,
          isCorrect: answer.isCorrect,
        })
      }
      setQuestionsDetails(questionDetails)
    } catch (err) {
      setError('Failed to load result details. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading result details..." />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert message={error} />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="text-center py-12">
          <p className="text-xl text-gray-600">Result not found.</p>
        </Card>
      </div>
    )
  }

  const correctAnswers = questionsDetails.filter(q => q.isCorrect).length
  const wrongAnswers = questionsDetails.filter(q => !q.isCorrect).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/results" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center">
        ← Back to Results
      </Link>

      {/* Result Header */}
      <Card
        variant="elevated"
        className={`mb-8 ${
          result.status === 'passed' ? 'border-l-4 border-green-600' : 'border-l-4 border-red-600'
        }`}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{result.examTitle}</h1>
            <p className="text-gray-600">
              Attempted on {new Date(result.attemptedAt).toLocaleDateString()} at{' '}
              {new Date(result.attemptedAt).toLocaleTimeString()}
            </p>
          </div>
          <Badge
            variant={result.status === 'passed' ? 'success' : 'danger'}
            size="md"
          >
            {result.status.toUpperCase()}
          </Badge>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 py-8 border-t border-b border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {result.score}/{result.totalMarks}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Percentage</p>
            <p className="text-3xl font-bold text-blue-600">{result.percentage}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Correct</p>
            <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Wrong</p>
            <p className="text-3xl font-bold text-red-600">{wrongAnswers}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Time Taken</p>
            <p className="text-3xl font-bold text-gray-900">{result.duration}m</p>
          </div>
        </div>
      </Card>

      {/* Questions Review */}
      <Card variant="elevated">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>
        <div className="space-y-6">
          {questionsDetails.map((question, index) => (
            <div
              key={question.id}
              className={`p-6 border-2 rounded-lg ${
                question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              {/* Question Number and Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-gray-700">Q{index + 1}</span>
                  {question.isCorrect ? (
                    <Badge variant="success" size="sm">✓ Correct</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">✗ Wrong</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="primary" size="sm">{question.subject}</Badge>
                  <Badge variant="warning" size="sm">{question.difficulty}</Badge>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6 p-4 bg-white rounded border-l-4 border-blue-500">
                <p className="text-lg font-semibold text-gray-900">{question.text}</p>
              </div>

              {/* Options */}
              <div className="mb-6 space-y-2">
                {question.options.map((option) => {
                  const isCorrectOption = option.id === question.correctAnswer
                  const isUserSelected = option.id === question.userAnswer
                  const isWrongSelection = isUserSelected && !isCorrectOption

                  return (
                    <div
                      key={option.id}
                      className={`p-3 rounded border-2 transition ${
                        isCorrectOption
                          ? 'border-green-500 bg-green-100'
                          : isWrongSelection
                          ? 'border-red-500 bg-red-100'
                          : isUserSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">
                          <span className="font-semibold">({option.id.toUpperCase()}) </span>
                          {option.text}
                        </span>
                        <div className="flex gap-2">
                          {isCorrectOption && (
                            <span className="text-green-600 font-bold">✓ Correct</span>
                          )}
                          {isWrongSelection && (
                            <span className="text-red-600 font-bold">✗ Your answer</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
                <p className="text-blue-800">{question.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Link to="/exams" className="flex-1">
          <Button variant="secondary" size="lg" className="w-full">
            Take Another Exam
          </Button>
        </Link>
        <Link to="/results" className="flex-1">
          <Button variant="primary" size="lg" className="w-full">
            Back to Results
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ResultDetails
