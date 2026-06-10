# MCQ System - Frontend

A comprehensive Multiple Choice Question (MCQ) exam platform built with React, Axios, and Tailwind CSS.

## Features

### 1. Question Bank
- Browse all available questions
- Search functionality
- Filter by subject and difficulty level
- View question explanations
- Navigate through questions with Previous/Next buttons

### 2. Exam System
- Browse available exams
- View exam details including duration, total questions, and passing criteria
- Take timed exams
- Answer questions one by one
- Real-time timer with visual warning when time is running out
- Question navigator to jump between questions
- Track answered/unanswered questions
- Submit exam when complete

### 3. Result System
- View list of all exam attempts
- Detailed result analysis including:
  - Score and percentage
  - Number of correct/wrong answers
  - Time taken
  - Question-by-question review with explanations
  - Visual indicators for correct and incorrect answers
  - Pass/Fail status

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useEffect)

## Project Structure

```
src/
├── components/
│   ├── common/              # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorAlert.jsx
│   ├── QuestionCard.jsx
│   ├── ExamCard.jsx
│   └── ResultCard.jsx
├── pages/
│   ├── Home.jsx
│   ├── QuestionBank.jsx
│   ├── ExamList.jsx
│   ├── ExamDetails.jsx
│   ├── ExamAttempt.jsx
│   ├── ResultList.jsx
│   └── ResultDetails.jsx
├── services/
│   ├── api.js              # Axios instance with interceptors
│   ├── questionService.js  # Question API calls
│   ├── examService.js      # Exam API calls
│   ├── resultService.js    # Result API calls
│   └── mockData.js         # Mock data for development
├── App.jsx
├── main.jsx
└── index.css
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mcq-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Development

The application uses mock data from `src/services/mockData.js` for development and testing. This allows full functionality without requiring a backend server.

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Integration

The application is structured to easily integrate with a backend API. The `src/services/api.js` file contains:

- Axios instance with base URL configuration
- Request interceptor for adding authentication tokens
- Response interceptor for error handling

Each service file (questionService, examService, resultService) uses the Axios instance and can be easily switched from mock data to real API endpoints by uncommenting the API calls.

## Features Detail

### Question Bank Page
- Search questions by text
- Filter by subject (Geography, Science, Literature, Mathematics)
- Filter by difficulty (Easy, Medium, Hard)
- View one question at a time with full explanation
- Progress indicator showing current position
- Next/Previous navigation

### Exam Pages
- **List View**: Browse all available exams with key details
- **Details View**: View complete exam information including all questions
- **Attempt View**: 
  - Real-time countdown timer
  - Progress bar showing answered questions
  - Visual question navigator
  - Color-coded question status (current, answered)
  - Auto-submit when time expires
  - Manual submission option

### Result Pages
- **List View**: Overview of all exam attempts with statistics
- **Details View**:
  - Color-coded question review (green for correct, red for wrong)
  - Show correct answer, user's answer, and explanation
  - Visual representation of performance
  - Option to retake exams or review other results

## Customization

### Colors
Edit `tailwind.config.js` to customize color scheme:
```javascript
colors: {
  primary: '#3B82F6',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
}
```

### Component Props
All reusable components accept props for customization:
- `Button`: variant, size, disabled state
- `Card`: variant, hoverable state
- `Badge`: variant, size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Future Enhancements

- [ ] User authentication and profile management
- [ ] Leaderboard and rankings
- [ ] Custom exam creation
- [ ] Real backend API integration
- [ ] Analytics dashboard
- [ ] Mobile app version
- [ ] Offline mode support
- [ ] Question difficulty analysis
