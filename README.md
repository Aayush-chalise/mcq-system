# MCQ System - Modern Online Exam Platform

A comprehensive Multiple Choice Question exam platform built with React, Clerk authentication, Supabase database, and modern UI with Framer Motion animations.

## Features

### 👤 User Features
- **Clerk Authentication**: Secure sign-in and sign-up with Clerk
- **Question Bank**: Practice with curated question sets across multiple subjects
- **Exams**: Take timed exams created by admins
- **Results Tracking**: View detailed performance analytics
- **Progress Dashboard**: Track your learning journey

### 👨‍💼 Admin Features
- **Create Question Sets**: Build question banks with multiple subjects
- **Question Management**: Add/edit questions with 4 options
- **Exam Creation**: Create exams from multiple question sets
- **Results Monitoring**: View user results and performance

### 🎨 Design Features
- Modern glassmorphism UI
- Smooth animations with Framer Motion
- Responsive design (mobile, tablet, desktop)
- Wave and grid textures
- Color scheme: #0d3b66 (Primary), #faf0ca (Secondary), #f4d35e (Accent)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React

## Supabase Schema

### Tables

#### question_sets
```sql
id: UUID (PK)
title: TEXT
description: TEXT
subject: TEXT
question_count: INTEGER
created_by: TEXT
status: TEXT (published/draft)
created_at: TIMESTAMP
```

#### questions
```sql
id: UUID (PK)
set_id: UUID (FK)
question_text: TEXT
options: JSONB (array of 4 options)
correct_answer: TEXT (A, B, C, or D)
created_at: TIMESTAMP
```

#### exams
```sql
id: UUID (PK)
title: TEXT
description: TEXT
duration: INTEGER (in minutes)
question_count: INTEGER
passing_score: INTEGER (%)
question_sets: JSONB (array of set IDs)
created_by: TEXT
status: TEXT (published/draft)
created_at: TIMESTAMP
```

#### results
```sql
id: UUID (PK)
user_id: TEXT (Clerk user ID)
set_id: UUID (FK)
score: INTEGER
total: INTEGER
percentage: INTEGER
answers: JSONB (user answers)
created_at: TIMESTAMP
```

## Installation

### Prerequisites
- Node.js 16+
- Clerk account
- Supabase account

### Setup

1. Clone repository
```bash
git clone <repo-url>
cd mcq-system
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
cp .env.example .env
```

4. Add environment variables
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

5. Start development server
```bash
npm run dev
```

## Setting Up Clerk

1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your Publishable Key
4. Add it to `.env`

### Mark Admin Users
In Clerk Dashboard:
1. Go to Users
2. Select a user
3. In "Public Metadata" add:
```json
{
  "role": "admin"
}
```

## Setting Up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL schema below in the SQL editor
4. Copy your URL and Anon Key to `.env`

### SQL Schema

```sql
-- Question Sets Table
CREATE TABLE question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  question_count INTEGER NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exams Table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  question_count INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  question_sets JSONB NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Results Table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  set_id UUID REFERENCES question_sets(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Policies for question_sets (public read, admin write)
CREATE POLICY "Allow public read" ON question_sets FOR SELECT USING (true);
CREATE POLICY "Allow admin insert" ON question_sets FOR INSERT WITH CHECK (true);

-- Policies for questions (public read)
CREATE POLICY "Allow public read" ON questions FOR SELECT USING (true);

-- Policies for exams (public read, admin write)
CREATE POLICY "Allow public read" ON exams FOR SELECT USING (true);
CREATE POLICY "Allow admin insert" ON exams FOR INSERT WITH CHECK (true);

-- Policies for results (users see own, admin sees all)
CREATE POLICY "Allow user see own" ON results FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Allow insert" ON results FOR INSERT WITH CHECK (true);
```

## Usage

### For Students
1. Sign up with Clerk
2. Go to Question Bank to practice question sets
3. Take exams from the Exams section
4. View results and track progress

### For Admins
1. Sign up and have admin role added in Clerk
2. Access Admin Panel
3. Create question sets
4. Create exams combining multiple question sets
5. View user results

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Button.jsx
│   │   ├── GlassCard.jsx
│   │   ├── WaveBackground.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorAlert.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── Home.jsx
│   ├── QuestionBank.jsx
│   ├── Exams.jsx
│   ├── Results.jsx
│   └── Admin.jsx
├── lib/
│   ├── supabase.js
│   └── utils.js
├── App.jsx
├── main.jsx
└── index.css
```

## Future Enhancements

- [ ] Real-time exam timer with notifications
- [ ] Advanced analytics dashboard
- [ ] Question difficulty analysis
- [ ] Leaderboard system
- [ ] Study recommendations
- [ ] Mobile app version
- [ ] PDF result export
- [ ] Question bank search and filtering

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
