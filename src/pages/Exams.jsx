import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import GlassCard from '../components/common/GlassCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import { Clock, BookOpen, BarChart3 } from 'lucide-react'

function Exams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('exams')
        .select('*')
        .eq('status', 'published')

      if (fetchError) throw fetchError
      setExams(data || [])
    } catch (err) {
      setError('Failed to load exams')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading exams..." />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-accent mb-12"
        >
          Available Exams
        </motion.h1>

        {exams.length === 0 ? (
          <GlassCard className="text-center py-12">
            <p className="text-xl text-white/80">No exams available yet</p>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="border-accent/30 h-full flex flex-col justify-between">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-accent mb-2">{exam.title}</h3>
                    <p className="text-white/70 mb-4">{exam.description}</p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-white/60">
                        <Clock size={18} className="text-accent" />
                        <span>{exam.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <BookOpen size={18} className="text-accent" />
                        <span>{exam.question_count} Questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <BarChart3 size={18} className="text-accent" />
                        <span>Pass: {exam.passing_score}%</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(`/exam/${exam.id}`)}
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    Start Exam
                  </Button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Exams
