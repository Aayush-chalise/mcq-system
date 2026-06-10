import { useState, useEffect } from 'react'
import resultService from '../services/resultService'
import ResultCard from '../components/ResultCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import Card from '../components/common/Card'

function ResultList() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await resultService.getAllResults()
      setResults(data)
    } catch (err) {
      setError('Failed to load results. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const passedResults = results.filter(r => r.status === 'passed')
  const failedResults = results.filter(r => r.status === 'failed')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Exam Results</h1>

      {error && (
        <ErrorAlert message={error} onClose={() => setError(null)} />
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card variant="elevated" className="text-center">
          <p className="text-sm font-medium text-gray-500 mb-2">Total Attempts</p>
          <p className="text-4xl font-bold text-gray-900">{results.length}</p>
        </Card>
        <Card variant="elevated" className="text-center">
          <p className="text-sm font-medium text-gray-500 mb-2">Passed</p>
          <p className="text-4xl font-bold text-green-600">{passedResults.length}</p>
        </Card>
        <Card variant="elevated" className="text-center">
          <p className="text-sm font-medium text-gray-500 mb-2">Failed</p>
          <p className="text-4xl font-bold text-red-600">{failedResults.length}</p>
        </Card>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading results..." />
      ) : results.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <p className="text-xl text-gray-600">No exam results yet. Take an exam to see your results here.</p>
        </Card>
      ) : (
        <div>
          {results.map(result => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ResultList
