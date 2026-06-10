import apiClient from './api'
import { mockQuestions } from './mockData'

const questionService = {
  // Get all questions with filters
  getAllQuestions: async (filters = {}) => {
    try {
      // Using mock data for now
      let questions = [...mockQuestions]

      if (filters.subject) {
        questions = questions.filter(q => q.subject.toLowerCase() === filters.subject.toLowerCase())
      }

      if (filters.difficulty) {
        questions = questions.filter(q => q.difficulty === filters.difficulty)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        questions = questions.filter(q =>
          q.text.toLowerCase().includes(searchLower) ||
          q.subject.toLowerCase().includes(searchLower)
        )
      }

      return Promise.resolve(questions)
      
      // Uncomment when backend is ready
      // return apiClient.get('/questions', { params: filters })
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Get single question by ID
  getQuestionById: async (id) => {
    try {
      const question = mockQuestions.find(q => q.id === id)
      if (!question) {
        return Promise.reject(new Error('Question not found'))
      }
      return Promise.resolve(question)
      
      // Uncomment when backend is ready
      // return apiClient.get(`/questions/${id}`)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Get questions by subject
  getQuestionsBySubject: async (subject) => {
    try {
      return questionService.getAllQuestions({ subject })
    } catch (error) {
      return Promise.reject(error)
    }
  },
}

export default questionService
