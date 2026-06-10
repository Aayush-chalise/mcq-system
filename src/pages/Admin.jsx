import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import Button from '../components/common/Button'
import GlassCard from '../components/common/GlassCard'
import ErrorAlert from '../components/common/ErrorAlert'
import { Plus, CheckCircle } from 'lucide-react'

function Admin() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('sets') // 'sets' or 'exams'
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({})
  const [questions, setQuestions] = useState([
    { id: 1, text: '', options: ['', '', '', ''], correctAnswer: '' },
  ])
  const [questionSets, setQuestionSets] = useState([])
  const [selectedSets, setSelectedSets] = useState([])

  const isAdmin = user?.publicMetadata?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8 flex items-center justify-center">
        <GlassCard className="text-center border-red-500/50">
          <p className="text-xl text-red-200">Access Denied: Admin panel is only for administrators</p>
        </GlassCard>
      </div>
    )
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { id: questions.length + 1, text: '', options: ['', '', '', ''], correctAnswer: '' },
    ])
  }

  const handleQuestionChange = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const handleOptionChange = (id, optionIndex, value) => {
    setQuestions(
      questions.map(q =>
        q.id === id
          ? {
              ...q,
              options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)),
            }
          : q
      )
    )
  }

  const handleCreateSet = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      if (!formData.title || !formData.subject) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Create question set
      const { data: setData, error: createSetError } = await supabase
        .from('question_sets')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            subject: formData.subject,
            question_count: questions.length,
            created_by: user.id,
            status: 'published',
          },
        ])
        .select()

      if (createSetError) throw createSetError

      const setId = setData[0].id

      // Create questions
      const questionsToInsert = questions.map(q => ({
        set_id: setId,
        question_text: q.text,
        options: JSON.stringify(q.options),
        correct_answer: q.correctAnswer,
      }))

      const { error: questionError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionError) throw questionError

      setSuccess(`✅ Question Set "${formData.title}" created successfully with ${questions.length} questions!`)
      
      setTimeout(() => {
        setShowForm(false)
        setFormData({})
        setQuestions([{ id: 1, text: '', options: ['', '', '', ''], correctAnswer: '' }])
        setSuccess(null)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to create question set')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExam = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      if (!formData.examTitle || !formData.examDuration || !formData.passingScore || selectedSets.length === 0) {
        setError('Please fill in all required fields and select at least one question set')
        setLoading(false)
        return
      }

      // Get total question count from selected sets
      const selectedSetData = questionSets.filter(set => selectedSets.includes(set.id))
      const totalQuestions = selectedSetData.reduce((sum, set) => sum + set.question_count, 0)

      // Create exam
      const { error: createExamError } = await supabase
        .from('exams')
        .insert([
          {
            title: formData.examTitle,
            description: formData.examDescription,
            duration: parseInt(formData.examDuration),
            question_count: totalQuestions,
            passing_score: parseInt(formData.passingScore),
            question_sets: JSON.stringify(selectedSets),
            created_by: user.id,
            status: 'published',
          },
        ])

      if (createExamError) throw createExamError

      setSuccess(`✅ Exam "${formData.examTitle}" created successfully!`)
      
      setTimeout(() => {
        setShowForm(false)
        setFormData({})
        setSelectedSets([])
        setSuccess(null)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to create exam')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleShowForm = async (tab) => {
    setActiveTab(tab)
    setShowForm(true)
    setError(null)
    setSuccess(null)
    
    // Fetch question sets for exam creation
    if (tab === 'exams') {
      try {
        const { data, error: fetchError } = await supabase
          .from('question_sets')
          .select('id, title, subject, question_count')
          .eq('status', 'published')

        if (fetchError) throw fetchError
        setQuestionSets(data || [])
      } catch (err) {
        setError('Failed to load question sets')
        console.error(err)
      }
    }
  }

  const toggleSetSelection = (setId) => {
    setSelectedSets(prev =>
      prev.includes(setId)
        ? prev.filter(id => id !== setId)
        : [...prev, setId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-600/20 border border-green-500/50 backdrop-blur-sm rounded-lg p-4 mb-4 flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6 text-green-400" />
            <p className="text-green-200">{success}</p>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-accent mb-8"
        >
          Admin Panel
        </motion.h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              setActiveTab('sets')
              setShowForm(false)
              setFormData({})
            }}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'sets'
                ? 'bg-accent text-primary'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Question Sets
          </button>
          <button
            onClick={() => {
              setActiveTab('exams')
              setShowForm(false)
              setFormData({})
            }}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'exams'
                ? 'bg-accent text-primary'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Exams
          </button>
        </div>

        {/* Create Button */}
        {!showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <Button
              onClick={() => handleShowForm(activeTab)}
              variant="primary"
              size="lg"
              className="flex items-center gap-2"
            >
              <Plus size={20} /> Create {activeTab === 'sets' ? 'Question Set' : 'Exam'}
            </Button>
          </motion.div>
        )}

        {/* Question Set Form */}
        {showForm && activeTab === 'sets' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <GlassCard className="border-accent/30">
              <h2 className="text-2xl font-bold text-accent mb-6">Create Question Set</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Physics Basics"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Subject *</label>
                  <input
                    type="text"
                    placeholder="e.g., Physics"
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                  <textarea
                    placeholder="Description of the question set"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Questions */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-accent">Questions</h3>
              {questions.map((q, idx) => (
                <GlassCard key={q.id} className="border-white/20">
                  <h4 className="text-lg font-bold text-accent mb-4">Question {idx + 1}</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Question Text *</label>
                      <textarea
                        value={q.text}
                        onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                        placeholder="Enter question text"
                        rows="2"
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx}>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Option {String.fromCharCode(65 + optIdx)} *
                          </label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                            placeholder={`Enter option ${String.fromCharCode(65 + optIdx)}`}
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Correct Answer *</label>
                      <select
                        value={q.correctAnswer}
                        onChange={(e) => handleQuestionChange(q.id, 'correctAnswer', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-accent"
                      >
                        <option value="" disabled>
                          Select correct answer
                        </option>
                        {['A', 'B', 'C', 'D'].map(letter => (
                          <option key={letter} value={letter}>
                            {letter}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            <Button
              onClick={handleAddQuestion}
              variant="secondary"
              size="md"
              className="flex items-center gap-2"
            >
              <Plus size={20} /> Add Question
            </Button>

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleCreateSet}
                variant="primary"
                size="lg"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Question Set'}
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false)
                  setFormData({})
                  setQuestions([{ id: 1, text: '', options: ['', '', '', ''], correctAnswer: '' }])
                }}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Exam Form */}
        {showForm && activeTab === 'exams' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <GlassCard className="border-accent/30">
              <h2 className="text-2xl font-bold text-accent mb-6">Create Exam</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Exam Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Physics Mid-Term Exam"
                    value={formData.examTitle || ''}
                    onChange={(e) => setFormData({ ...formData, examTitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                  <textarea
                    placeholder="Exam description"
                    value={formData.examDescription || ''}
                    onChange={(e) => setFormData({ ...formData, examDescription: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Duration (minutes) *</label>
                    <input
                      type="number"
                      placeholder="60"
                      value={formData.examDuration || ''}
                      onChange={(e) => setFormData({ ...formData, examDuration: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Passing Score (%) *</label>
                    <input
                      type="number"
                      placeholder="60"
                      value={formData.passingScore || ''}
                      onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Select Question Sets */}
            <GlassCard className="border-accent/30">
              <h3 className="text-xl font-bold text-accent mb-4">Select Question Sets *</h3>
              
              {questionSets.length === 0 ? (
                <p className="text-white/60">No question sets available. Create some first!</p>
              ) : (
                <div className="space-y-2">
                  {questionSets.map(set => (
                    <label
                      key={set.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-white/10"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSets.includes(set.id)}
                        onChange={() => toggleSetSelection(set.id)}
                        className="w-4 h-4 cursor-pointer accent-accent"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{set.title}</p>
                        <p className="text-sm text-white/60">{set.subject} • {set.question_count} questions</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleCreateExam}
                variant="primary"
                size="lg"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Exam'}
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false)
                  setFormData({})
                  setSelectedSets([])
                }}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Admin
