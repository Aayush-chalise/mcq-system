import { Link } from 'react-router-dom'
import Card from './common/Card'
import Badge from './common/Badge'
import Button from './common/Button'

function ResultCard({ result }) {
  const statusVariant = result.status === 'passed' ? 'success' : 'danger'

  return (
    <Card variant="elevated" className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{result.examTitle}</h3>
            <Badge variant={statusVariant}>
              {result.status.toUpperCase()}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 mb-4">Attempted on {new Date(result.attemptedAt).toLocaleDateString()}</p>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-2xl font-bold text-gray-900">{result.score}/{result.totalMarks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Percentage</p>
              <p className="text-2xl font-bold text-blue-600">{result.percentage}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Correct</p>
              <p className="text-lg font-semibold text-green-600">
                {result.answers.filter(a => a.isCorrect).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Wrong</p>
              <p className="text-lg font-semibold text-red-600">
                {result.answers.filter(a => !a.isCorrect).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Taken</p>
              <p className="text-lg font-semibold text-gray-900">{result.duration} mins</p>
            </div>
          </div>
        </div>
      </div>

      <Link to={`/results/${result.id}`} className="mt-4 block">
        <Button variant="primary" size="md" className="w-full">
          View Detailed Report
        </Button>
      </Link>
    </Card>
  )
}

export default ResultCard
