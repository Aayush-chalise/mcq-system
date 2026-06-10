import Card from './common/Card'
import Badge from './common/Badge'

function QuestionCard({ question, isSelected = false, onSelect }) {
  return (
    <Card
      variant="elevated"
      hoverable
      className="mb-4"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="primary">{question.subject}</Badge>
            <Badge variant="warning">difficulty</Badge>
            <Badge variant={getDifficultyVariant(question.difficulty)}>
              {question.difficulty}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{question.text}</h3>
        </div>
        {isSelected && (
          <div className="ml-4 flex-shrink-0">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600">
              ✓
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}

function getDifficultyVariant(difficulty) {
  switch (difficulty) {
    case 'easy':
      return 'success'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'danger'
    default:
      return 'default'
  }
}

export default QuestionCard
