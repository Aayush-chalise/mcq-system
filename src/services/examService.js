import apiClient from './api'
import { mockExams } from './mockData'

const examService = {
  // Get all exams
  getAllExams: async () => {
    try {
      // Using mock data for now
      return Promise.resolve(mockExams)
      
      // Uncomment when backend is ready
      // return apiClient.get('/exams')
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Get exam by ID
  getExamById: async (id) => {
    try {
      const exam = mockExams.find(e => e.id === parseInt(id))
      if (!exam) {
        return Promise.reject(new Error('Exam not found'))
      }
      return Promise.resolve(exam)
      
      // Uncomment when backend is ready
      // return apiClient.get(`/exams/${id}`)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Get exam questions
  getExamQuestions: async (examId) => {
    try {
      const exam = await examService.getExamById(examId)
      return Promise.resolve(exam.questions)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Submit exam attempt
  submitExam: async (examId, answers) => {
    try {
      // Simulate API call with delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            resultId: Math.random().toString(36).substr(2, 9),
            message: 'Exam submitted successfully',
          })
        }, 500)
      })
      
      // Uncomment when backend is ready
      // return apiClient.post(`/exams/${examId}/submit`, { answers })
    } catch (error) {
      return Promise.reject(error)
    }
  },
}

export default examService
