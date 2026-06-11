import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import GlassCard from "../components/common/GlassCard";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import { formatDate } from "../lib/utils";
import { CheckCircle, XCircle, ArrowLeft, BarChart3 } from "lucide-react";

function ResultDetails() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResultDetail();
  }, [id]);

  const fetchResultDetail = async () => {
    try {
      setLoading(true);

      // Fetch the result
      const { data: resultData, error: resultError } = await supabase
        .from("results")
        .select("*, question_sets(title, subject)")
        .eq("id", id)
        .eq("user_id", user.id) // security: only own results
        .single();

      if (resultError) throw resultError;
      if (!resultData) throw new Error("Result not found");

      setResult(resultData);

      // Fetch the questions for this set
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("set_id", resultData.set_id)
        .order("created_at", { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
    } catch (err) {
      setError("Failed to load result details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading result details..." />;

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8 flex items-center justify-center">
        <GlassCard className="text-center">
          <p className="text-xl text-white/80 mb-4">Result not found.</p>
          <Button variant="primary" onClick={() => navigate("/results")}>
            Back to Results
          </Button>
        </GlassCard>
      </div>
    );
  }

  const userAnswers = result.answers || {};
  const passed = result.percentage >= 60; // adjust if you store passing_score

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/results")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Results
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-accent mb-1">
            {result.question_sets?.title}
          </h1>
          <p className="text-white/60">
            {result.question_sets?.subject} • {formatDate(result.created_at)}
          </p>
        </motion.div>

        {/* Score summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        >
          <GlassCard className="text-center border-accent/30 py-4">
            <p className="text-white/60 text-xs mb-1">Score</p>
            <p className="text-3xl font-bold text-accent">
              {result.score}/{result.total}
            </p>
          </GlassCard>
          <GlassCard className="text-center border-accent/30 py-4">
            <p className="text-white/60 text-xs mb-1">Percentage</p>
            <p className="text-3xl font-bold text-accent">
              {result.percentage}%
            </p>
          </GlassCard>
          <GlassCard className="text-center border-accent/30 py-4">
            <p className="text-white/60 text-xs mb-1">Correct</p>
            <p className="text-3xl font-bold text-green-400">{result.score}</p>
          </GlassCard>
          <GlassCard className="text-center border-accent/30 py-4">
            <p className="text-white/60 text-xs mb-1">Wrong</p>
            <p className="text-3xl font-bold text-red-400">
              {result.total - result.score}
            </p>
          </GlassCard>
        </motion.div>

        {/* Pass / Fail badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard
            className={`text-center py-5 border-2 ${
              passed
                ? "border-green-500/50 bg-green-500/10"
                : "border-red-500/50 bg-red-500/10"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              {passed ? (
                <CheckCircle className="text-green-400" size={28} />
              ) : (
                <XCircle className="text-red-400" size={28} />
              )}
              <span
                className={`text-2xl font-bold ${passed ? "text-green-300" : "text-red-300"}`}
              >
                {passed ? "Passed" : "Failed"}
              </span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Per-question breakdown */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-accent flex items-center gap-2">
              <BarChart3 size={20} /> Question Breakdown
            </h2>
            {questions.map((q, idx) => {
              const userAnswer =
                userAnswers[q.id] || userAnswers[String(idx)] || null;
              const isCorrect = userAnswer === q.correct_answer;
              const options = Array.isArray(q.options)
                ? q.options
                : JSON.parse(q.options || "[]");

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <GlassCard
                    className={`border-l-4 ${
                      isCorrect ? "border-l-green-500" : "border-l-red-500"
                    } border-white/10`}
                  >
                    {/* Question header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <p className="font-semibold text-white">
                        <span className="text-accent mr-2">Q{idx + 1}.</span>
                        {q.question_text}
                      </p>
                      {isCorrect ? (
                        <CheckCircle
                          className="text-green-400 shrink-0"
                          size={22}
                        />
                      ) : (
                        <XCircle className="text-red-400 shrink-0" size={22} />
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                        const isThisCorrect = letter === q.correct_answer;
                        const isUserPick = letter === userAnswer;

                        let style = "bg-white/5 border-white/10 text-white/70";
                        if (isThisCorrect)
                          style =
                            "bg-green-500/20 border-green-500/50 text-green-200";
                        else if (isUserPick && !isThisCorrect)
                          style =
                            "bg-red-500/20 border-red-500/50 text-red-200";

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm ${style}`}
                          >
                            <span className="font-bold w-5 shrink-0">
                              {letter}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isThisCorrect && (
                              <span className="text-xs font-semibold text-green-400">
                                Correct
                              </span>
                            )}
                            {isUserPick && !isThisCorrect && (
                              <span className="text-xs font-semibold text-red-400">
                                Your answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* If unanswered */}
                    {!userAnswer && (
                      <p className="mt-3 text-xs text-yellow-400">
                        ⚠ Not answered
                      </p>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom back button */}
        <div className="mt-8">
          <Button
            variant="secondary"
            onClick={() => navigate("/results")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Results
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ResultDetails;
