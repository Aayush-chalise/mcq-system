import { Link } from 'react-router-dom'
import Card from './common/Card'
import Badge from './common/Badge'
import Button from './common/Button'

function ExamCard({ exam }) {
  return (
    <Card variant="elevated" className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{exam.title}</h3>
            <Badge variant="primary">Active</Badge>
          </div>
          <p className="text-gray-600 mb-3">{exam.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-lg font-semibold text-gray-900">{exam.duration} mins</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Questions</p>
              <p className="text-lg font-semibold text-gray-900">{exam.totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Passing Score</p>
              <p className="text-lg font-semibold text-gray-900">{exam.passingScore}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="text-lg font-semibold text-gray-900">{exam.subject}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Link to={`/exams/${exam.id}`} className="flex-1">
          <Button variant="outline" size="md" className="w-full">
            View Details
          </Button>
        </Link>
        <Link to={`/exams/${exam.id}/attempt`} className="flex-1">
          <Button variant="primary" size="md" className="w-full">
            Start Exam
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default ExamCard
