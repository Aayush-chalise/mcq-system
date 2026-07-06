import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const timerRef = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: examData, error: examErr } = await supabase
          .from('exams')
          .select('*')
          .eq('id', id)
          .single();
        if (examErr) throw examErr;
        setExam(examData);

        const sets = Array.isArray(examData.question_sets)
          ? examData.question_sets
          : JSON.parse(examData.question_sets || '[]');

        const { data: qs, error: qErr } = await supabase
          .from('questions')
          .select('*')
          .in('set_id', sets || [])
          .order('created_at', { ascending: true });
        if (qErr) throw qErr;

        const normalized = (qs || []).map((q) => ({
          id: q.id,
          text: q.question_text,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
          correct: q.correct_answer,
          set_id: q.set_id,
        }));
        setQuestions(normalized);

        const secs = (examData.duration || 0) * 60;
        setSecondsLeft(secs);
        timerRef.current = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleSubmit();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        setError(err.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAnswer = (qId, answer) => setAnswers((prev) => ({ ...prev, [qId]: answer }));
  const handleNext = () => setIndex((i) => Math.min(i + 1, questions.length - 1));
  const handlePrev = () => setIndex((i) => Math.max(i - 1, 0));

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    const total = questions.length;
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0);
    const percentage = total ? Math.round((score / total) * 100) : 0;

    try {
      // Use Clerk user id so Results.jsx which queries by user.id can find the record
      const userId = user?.id || null;
      const { error: insertErr } = await supabase.from('results').insert([
        {
          user_id: userId,
          set_id: questions[0]?.set_id || null,
          score,
          total,
          percentage,
          answers: JSON.stringify(answers),
        },
      ]);
      if (insertErr) {
        console.error('Failed to save result:', insertErr);
      }
    } catch (err) {
      console.error('Failed to save result', err);
    }

    navigate('/results');
  };

  if (loading) return <LoadingSpinner text="Loading exam..." />;
  if (error) return <ErrorAlert message={error} onClose={() => setError(null)} />;
  if (!exam) return <div className="p-6">Exam not found</div>;
  if (questions.length === 0) return <div className="p-6">No questions in this exam</div>;

  const q = questions[index];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">{exam.title}</h2>
      <p className="text-sm text-gray-400 mb-4">{exam.description}</p>
      <div className="mb-4">Time left: {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</div>

      <div className="bg-white/5 p-6 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Q{index + 1}. {q.text}</h3>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <label key={i} className="block p-2 border rounded hover:bg-white/5 cursor-pointer">
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={answers[q.id] === opt}
                onChange={() => handleAnswer(q.id, opt)}
                className="mr-2"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handlePrev} className="px-4 py-2 bg-gray-700 rounded">Prev</button>
        <button onClick={handleNext} className="px-4 py-2 bg-gray-700 rounded">Next</button>
        <div className="flex-1" />
        <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 rounded">Submit</button>
      </div>
    </div>
  );
}
