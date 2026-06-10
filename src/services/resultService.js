import apiClient from './api'
import { mockResults } from './mockData'

const resultService = {
  // Get all results
  getAllResults: async () => {
    try {
      // Using mock data for now
      return Promise.resolve(mockResults)
      
      // Uncomment when backend is ready
      // return apiClient.get('/results')
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Get result by ID
  getResultById: async (id) => {
    try {
      const result = mockResults.find(r => r.id === parseInt(id))
      if (!result) {
        return Promise.reject(new Error('Result not found'))
      }
      return Promise.resolve(result)
      
      // Uncomment when backend is ready
      // return apiClient.get(`/results/${id}`)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Get results by exam ID
  getResultsByExam: async (examId) => {
    try {
      const results = mockResults.filter(r => r.examId === parseInt(examId))
      return Promise.resolve(results)
    } catch (error) {
      return Promise.reject(error)
    }
  },
}

export default resultService
