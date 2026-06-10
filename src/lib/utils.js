export const calculateScore = (userAnswers, questions) => {
  let correct = 0
  userAnswers.forEach((answer) => {
    const question = questions.find(q => q.id === answer.questionId)
    if (question && question.correctAnswer === answer.selectedAnswer) {
      correct++
    }
  })
  const total = questions.length
  const percentage = Math.round((correct / total) * 100)
  return { correct, total, percentage }
}

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
