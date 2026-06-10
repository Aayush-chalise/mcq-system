import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import examService from '../services/examService'
import questionService from '../services/questionService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'

function ExamDetails() {
  const { examId } = useParams()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchExamDetails()
  }, [examId])

  const fetchExamDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const examData = await examService.getExamById(examId)
      setExam(examData)

      // Fetch exam questions
      const questionIds = examData.questions
      const questionsData = []
      for (const id of questionIds) {
        const q = await questionService.getQuestionById(id)
        questionsData.push(q)
      }
      setQuestions(questionsData)
    } catch (err) {
      setError('Failed to load exam details. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading exam details..." />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert message={error} />
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="text-center py-12">
          <p className="text-xl text-gray-600">Exam not found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/exams" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center">
        ← Back to Exams
      </Link>

      {/* Exam Header */}
      <Card variant="elevated" className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{exam.title}</h1>
            <Badge variant="primary" size="md">{exam.subject}</Badge>
          </div>
        </div>
        <p className="text-lg text-gray-600 mb-6">{exam.description}</p>

        {/* Exam Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-gray-200 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="text-3xl font-bold text-gray-900">{exam.duration}</p>
            <p className="text-sm text-gray-600">minutes</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Questions</p>
            <p className="text-3xl font-bold text-gray-900">{exam.totalQuestions}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Passing Score</p>
            <p className="text-3xl font-bold text-green-600">{exam.passingScore}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <Badge variant="success" size="md">Active</Badge>
          </div>
        </div>
      </Card>

      {/* Questions Preview */}
      <Card variant="elevated" className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions in This Exam</h2>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="flex items-start gap-4">
                <span className="font-bold text-lg text-gray-500 bg-gray-100 px-3 py-1 rounded">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900 mb-2">{question.text}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{question.subject}</Badge>
                    <Badge variant="warning" size="sm">{question.difficulty}</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link to={`/exams/${exam.id}/attempt`} className="flex-1">
          <Button variant="primary" size="lg" className="w-full">
            Start Exam Now
          </Button>
        </Link>
        <Link to="/exams" className="flex-1">
          <Button variant="secondary" size="lg" className="w-full">
            Back to Exams
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ExamDetails
