import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import QuestionBank from './pages/QuestionBank'
import ExamList from './pages/ExamList'
import ExamDetails from './pages/ExamDetails'
import ExamAttempt from './pages/ExamAttempt'
import ResultList from './pages/ResultList'
import ResultDetails from './pages/ResultDetails'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questions" element={<QuestionBank />} />
          <Route path="/exams" element={<ExamList />} />
          <Route path="/exams/:examId" element={<ExamDetails />} />
          <Route path="/exams/:examId/attempt" element={<ExamAttempt />} />
          <Route path="/results" element={<ResultList />} />
          <Route path="/results/:resultId" element={<ResultDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
