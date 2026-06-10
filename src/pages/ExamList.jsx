import { useState, useEffect } from 'react'
import examService from '../services/examService'
import ExamCard from '../components/ExamCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import Card from '../components/common/Card'

function ExamList() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await examService.getAllExams()
      setExams(data)
    } catch (err) {
      setError('Failed to load exams. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Available Exams</h1>

      {error && (
        <ErrorAlert message={error} onClose={() => setError(null)} />
      )}

      {loading ? (
        <LoadingSpinner text="Loading exams..." />
      ) : exams.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <p className="text-xl text-gray-600">No exams available at the moment.</p>
        </Card>
      ) : (
        <div>
          <div className="mb-6 text-gray-600">
            <p className="text-lg">Total Exams: <span className="font-bold text-gray-900">{exams.length}</span></p>
          </div>
          {exams.map(exam => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ExamList
