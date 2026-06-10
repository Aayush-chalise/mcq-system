import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import examService from '../services/examService'
import questionService from '../services/questionService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'

function ExamAttempt() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchExamData()
  }, [examId])

  useEffect(() => {
    if (!timeLeft || submitted) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, submitted])

  const fetchExamData = async () => {
    setLoading(true)
    setError(null)
    try {
      const examData = await examService.getExamById(examId)
      setExam(examData)
      setTimeLeft(examData.duration * 60) // Convert to seconds

      // Fetch exam questions
      const questionIds = examData.questions
      const questionsData = []
      for (const id of questionIds) {
        const q = await questionService.getQuestionById(id)
        questionsData.push(q)
      }
      setQuestions(questionsData)
    } catch (err) {
      setError('Failed to load exam. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAnswer = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }))
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

  const handleSubmitExam = async () => {
    setSubmitted(true)
    try {
      const result = await examService.submitExam(examId, answers)
      // Save result to localStorage for now
      localStorage.setItem('lastResult', JSON.stringify(result))
      setTimeout(() => {
        navigate(`/results/${result.resultId}`)
      }, 1500)
    } catch (err) {
      setError('Failed to submit exam. Please try again.')
      console.error(err)
      setSubmitted(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length

  if (loading) {
    return <LoadingSpinner text="Loading exam..." />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert message={error} />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="text-center py-12">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Exam Submitted Successfully!</h2>
          <p className="text-lg text-gray-600 mb-6">Redirecting to results...</p>
          <LoadingSpinner text="" />
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Timer */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{exam?.title}</h1>
          <p className="text-gray-600 mt-1">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className={`text-4xl font-bold p-4 rounded-lg ${
          timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm text-gray-600">
          <span>Progress</span>
          <span>{answeredCount}/{questions.length} answered</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <Card variant="elevated" className="mb-8">
          {/* Question */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
            <p className="text-2xl font-semibold text-gray-900">{currentQuestion.text}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                  answers[currentQuestion.id] === option.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={answers[currentQuestion.id] === option.id}
                    onChange={() => handleSelectAnswer(currentQuestion.id, option.id)}
                    className="mr-3 cursor-pointer"
                  />
                  <span className="text-lg text-gray-900">{option.text}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Answer Status */}
          {answers[currentQuestion.id] && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">✓ Answer selected</p>
            </div>
          )}
        </Card>
      )}

      {/* Question Navigator */}
      <Card variant="elevated" className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Question Navigator</h3>
        <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`p-2 rounded font-semibold transition ${
                idx === currentIndex
                  ? 'bg-blue-600 text-white'
                  : answers[q.id]
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={`Question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          <Badge variant="primary" size="sm">■</Badge> Current
          <span className="ml-4"><Badge variant="success" size="sm">■</Badge> Answered</span>
        </p>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant={currentIndex === 0 ? 'secondary' : 'primary'}
          className="flex-1"
        >
          ← Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          variant={currentIndex === questions.length - 1 ? 'secondary' : 'primary'}
          className="flex-1"
        >
          Next →
        </Button>
        <Button
          onClick={handleSubmitExam}
          variant="success"
          size="lg"
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Submit Exam
        </Button>
      </div>
    </div>
  )
}

export default ExamAttempt
