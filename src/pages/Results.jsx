import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import GlassCard from '../components/common/GlassCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import { formatDate } from '../lib/utils'
import { BarChart3, Clock } from 'lucide-react'

function Results() {
  const { user } = useUser()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('results')
        .select('*, question_sets(title, subject)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setResults(data || [])
    } catch (err) {
      setError('Failed to load results')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading results..." />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-accent mb-12"
        >
          Your Results
        </motion.h1>

        {/* Statistics */}
        {results.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="text-center border-accent/30">
                <p className="text-white/60 text-sm mb-2">Total Attempts</p>
                <p className="text-4xl font-bold text-accent">{results.length}</p>
              </GlassCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="text-center border-accent/30">
                <p className="text-white/60 text-sm mb-2">Average Score</p>
                <p className="text-4xl font-bold text-accent">
                  {Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)}%
                </p>
              </GlassCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="text-center border-accent/30">
                <p className="text-white/60 text-sm mb-2">Best Score</p>
                <p className="text-4xl font-bold text-accent">
                  {Math.max(...results.map(r => r.percentage))}%
                </p>
              </GlassCard>
            </motion.div>
          </div>
        )}

        {results.length === 0 ? (
          <GlassCard className="text-center py-12">
            <p className="text-xl text-white/80 mb-6">No results yet. Start practicing to see your results!</p>
            <Button variant="primary" size="lg" onClick={() => navigate('/question-bank')}>
              Go to Question Bank
            </Button>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="border-accent/20 hover:border-accent/50 cursor-pointer transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-accent mb-2">
                        {result.question_sets?.title}
                      </h3>
                      <p className="text-white/60 text-sm mb-3">
                        {result.question_sets?.subject} • {formatDate(result.created_at)}
                      </p>
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <BarChart3 size={16} className="text-accent" />
                          <span className="text-white/80">
                            Score: <span className="font-bold text-accent">{result.score}/{result.total}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 size={16} className="text-accent" />
                          <span className="text-white/80">
                            Percentage: <span className="font-bold text-accent">{result.percentage}%</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/result/${result.id}`)}
                    >
                      View Details
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

export default Results
