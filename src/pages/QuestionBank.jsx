import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import Button from '../components/common/Button'
import GlassCard from '../components/common/GlassCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

function QuestionBank() {
  const { user } = useUser()
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSet, setSelectedSet] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchSets()
  }, [])

  const fetchSets = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('question_sets')
        .select('*')
        .eq('status', 'published')

      if (fetchError) throw fetchError
      setSets(data || [])
    } catch (err) {
      setError('Failed to load question sets')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSet = async (setId) => {
    try {
      const { data: questions, error: fetchError } = await supabase
        .from('questions')
        .select('*')
        .eq('set_id', setId)

      if (fetchError) throw fetchError

      const set = sets.find(s => s.id === setId)
      setSelectedSet({ ...set, questions: questions || [] })
      setCurrentQuestionIndex(0)
      setAnswers({})
      setSubmitted(false)
      setResult(null)
    } catch (err) {
      setError('Failed to load questions')
      console.error(err)
    }
  }

  const handleSelectAnswer = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleSubmit = async () => {
    try {
      const questions = selectedSet.questions
      let correct = 0

      questions.forEach(question => {
        if (answers[question.id] === question.correct_answer) {
          correct++
        }
      })

      const percentage = Math.round((correct / questions.length) * 100)

      // Save result to database
      const { error: saveError } = await supabase
        .from('results')
        .insert([
          {
            user_id: user.id,
            set_id: selectedSet.id,
            score: correct, 
            total: questions.length,
            percentage,
            answers: JSON.stringify(answers),
          },
        ])

      if (saveError) throw saveError

      setResult({ correct, total: questions.length, percentage })
      setSubmitted(true)
    } catch (err) {
      setError('Failed to submit answers')
      console.error(err)
    }
  }

  const handleReset = () => {
    setSelectedSet(null)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setSubmitted(false)
    setResult(null)
  }

  if (loading) return <LoadingSpinner text="Loading question sets..." />

  if (!selectedSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center text-accent mb-12"
          >
            Question Bank
          </motion.h1>

          {sets.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-xl text-white/80">No question sets available yet</p>
            </GlassCard>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sets.map((set, index) => (
                <motion.div
                  key={set.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard
                    className="cursor-pointer hover:border-accent/50 h-full flex flex-col justify-between group"
                    onClick={() => handleSelectSet(set.id)}
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-accent mb-2">{set.title}</h3>
                      <p className="text-white/70 mb-4">{set.description}</p>
                      <div className="flex gap-4 text-sm text-white/60">
                        <span>📚 {set.subject}</span>
                        <span>❓ {set.question_count} Questions</span>
                      </div>
                    </div>
                    <div className="mt-4 group-hover:translate-x-2 transition-transform">
                      <Button variant="secondary" size="md" className="w-full">
                        Start Practicing
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <GlassCard className="border-accent/50">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4 flex justify-center"
              >
                ✅
              </motion.div>
              <h2 className="text-4xl font-bold text-accent mb-4">Quiz Completed!</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                  <span className="text-white/80">Score</span>
                  <span className="text-3xl font-bold text-accent">
                    {result.correct}/{result.total}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                  <span className="text-white/80">Percentage</span>
                  <span className="text-3xl font-bold text-accent">{result.percentage}%</span>
                </div>
              </div>
              <Button
                onClick={handleReset}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Practice Another Set
              </Button>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentQuestion = selectedSet.questions[currentQuestionIndex]
  const isAnswered = answers[currentQuestion?.id]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-accent">{selectedSet.title}</h1>
            <p className="text-white/60 mt-2">{selectedSet.subject}</p>
          </div>
          <Button onClick={handleReset} variant="secondary" size="md">
            Exit
          </Button>
        </motion.div>

        {/* Progress */}
        <GlassCard className="mb-8">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Question {currentQuestionIndex + 1} of {selectedSet.questions.length}</span>
              <span className="text-accent font-bold">{Object.keys(answers).length} / {selectedSet.questions.length}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-accent to-secondary h-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / selectedSet.questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Question Card */}
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 mb-8"
          >
            <GlassCard className="border-accent/30">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-accent mb-6">{currentQuestion.question_text}</h2>
              </div>

              <div className="space-y-3">
                {JSON.parse(currentQuestion.options).map((option, index) => {
                  const optionId = String.fromCharCode(65 + index) // A, B, C, D
                  const isSelected = answers[currentQuestion.id] === optionId

                  return (
                    <motion.label
                      key={optionId}
                      whileHover={{ x: 5 }}
                      className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-white/10 hover:border-accent/30 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={optionId}
                          checked={isSelected}
                          onChange={() => handleSelectAnswer(currentQuestion.id, optionId)}
                          className="mt-1 w-4 h-4 cursor-pointer accent-accent"
                        />
                        <div className="flex-1">
                          <span className="font-bold text-accent">{optionId}. </span>
                          <span className="text-white">{option}</span>
                        </div>
                        {isSelected && <CheckCircle size={20} className="text-accent flex-shrink-0" />}
                      </div>
                    </motion.label>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            variant="secondary"
            size="md"
            className="flex items-center gap-2"
          >
            <ChevronLeft size={20} /> Previous
          </Button>

          <div className="flex items-center justify-center gap-2">
            {selectedSet.questions.map((q, idx) => (
              <motion.button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                whileHover={{ scale: 1.1 }}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  idx === currentQuestionIndex
                    ? 'bg-accent text-primary'
                    : answers[q.id]
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {idx + 1}
              </motion.button>
            ))}
          </div>

          {currentQuestionIndex === selectedSet.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              variant="success"
              size="md"
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              Submit <CheckCircle size={20} />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              variant="primary"
              size="md"
              className="flex items-center gap-2"
            >
              Next <ChevronRight size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionBank
