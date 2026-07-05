import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import Button from "../components/common/Button";
import GlassCard from "../components/common/GlassCard";
import ErrorAlert from "../components/common/ErrorAlert";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  Plus,
  CheckCircle,
  Trash2,
  Pencil,
  X,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <GlassCard className="max-w-sm w-full mx-4 border-red-500/40">
          <p className="text-white text-lg font-semibold mb-2">Are you sure?</p>
          <p className="text-white/70 text-sm mb-6">{message}</p>
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-500"
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

// ─── Main Admin Component ─────────────────────────────────────────────────────
function Admin() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sets");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // list data
  const [questionSets, setQuestionSets] = useState([]);
  const [exams, setExams] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // form state
  const [mode, setMode] = useState(null); // null | 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [questions, setQuestions] = useState([
    { id: 1, text: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [allPublishedSets, setAllPublishedSets] = useState([]);
  const [selectedSets, setSelectedSets] = useState([]);

  // delete confirm
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id, title }

  const isAdmin = user?.publicMetadata?.role === "admin";

  // ── fetch lists on tab change ───────────────────────────────────────────────
  useEffect(() => {
    if (isAdmin) fetchList();
  }, [activeTab, isAdmin]);

  const fetchList = async () => {
    try {
      setListLoading(true);
      if (activeTab === "sets") {
        const { data, error: e } = await supabase
          .from("question_sets")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });
        if (e) throw e;
        setQuestionSets(data || []);
      } else {
        const { data, error: e } = await supabase
          .from("exams")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });
        if (e) throw e;
        setExams(data || []);
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setListLoading(false);
    }
  };

  const fetchPublishedSets = async () => {
    const { data, error: e } = await supabase
      .from("question_sets")
      .select("id, title, subject, question_count")
      .eq("status", "published");
    if (!e) setAllPublishedSets(data || []);
  };

  // ── access guard ──────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8 flex items-center justify-center">
        <GlassCard className="text-center border-red-500/50">
          <p className="text-xl text-red-200">
            Access Denied: Admin panel is only for administrators
          </p>
        </GlassCard>
      </div>
    );
  }

  // ── question helpers ───────────────────────────────────────────────────────
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
  };

  const handleRemoveQuestion = (id) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id, field, value) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );

  const handleOptionChange = (id, optIdx, value) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              options: q.options.map((o, i) => (i === optIdx ? value : o)),
            }
          : q,
      ),
    );

  const toggleSetSelection = (setId) =>
    setSelectedSets((prev) =>
      prev.includes(setId) ? prev.filter((id) => id !== setId) : [...prev, setId],
    );

  // ── open create form ──────────────────────────────────────────────────────
  const openCreate = async () => {
    setMode("create");
    setEditingId(null);
    setFormData({});
    setQuestions([
      { id: 1, text: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
    setSelectedSets([]);
    setError(null);
    setSuccess(null);
    if (activeTab === "exams") await fetchPublishedSets();
  };

  // ── open edit form ────────────────────────────────────────────────────────
  const openEdit = async (item) => {
    setMode("edit");
    setEditingId(item.id);
    setError(null);
    setSuccess(null);

    if (activeTab === "sets") {
      setFormData({
        title: item.title,
        subject: item.subject,
        description: item.description || "",
      });
      // load existing questions
      const { data: qs } = await supabase
        .from("questions")
        .select("*")
        .eq("set_id", item.id)
        .order("created_at", { ascending: true });

      setQuestions(
        (qs || []).map((q, i) => ({
          id: q.id, // use real UUID so we can update/delete
          dbId: q.id,
          text: q.question_text,
          options: Array.isArray(q.options)
            ? q.options
            : JSON.parse(q.options || "[]"),
          correctAnswer: q.correct_answer,
        })),
      );
    } else {
      setFormData({
        examTitle: item.title,
        examDescription: item.description || "",
        examDuration: String(item.duration),
        passingScore: String(item.passing_score),
      });
      const sets = Array.isArray(item.question_sets)
        ? item.question_sets
        : JSON.parse(item.question_sets || "[]");
      setSelectedSets(sets);
      await fetchPublishedSets();
    }
  };

  const closeForm = () => {
    setMode(null);
    setEditingId(null);
    setFormData({});
    setQuestions([
      { id: 1, text: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
    setSelectedSets([]);
    setError(null);
    setSuccess(null);
  };

  // ── create / update question set ───────────────────────────────────────────
  const handleSaveSet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.title || !formData.subject) {
        setError("Please fill in all required fields");
        return;
      }

      if (mode === "create") {
        const { data: setData, error: setErr } = await supabase
          .from("question_sets")
          .insert([
            {
              title: formData.title,
              description: formData.description,
              subject: formData.subject,
              question_count: questions.length,
              created_by: user.id,
              status: "published",
            },
          ])
          .select();
        if (setErr) throw setErr;

        const setId = setData[0].id;
        const toInsert = questions.map((q) => ({
          set_id: setId,
          question_text: q.text,
          options: JSON.stringify(q.options),
          correct_answer: q.correctAnswer,
        }));
        const { error: qErr } = await supabase
          .from("questions")
          .insert(toInsert);
        if (qErr) throw qErr;

        setSuccess(`✅ Question Set "${formData.title}" created successfully!`);
      } else {
        // update set metadata
        const { error: setErr } = await supabase
          .from("question_sets")
          .update({
            title: formData.title,
            description: formData.description,
            subject: formData.subject,
            question_count: questions.length,
          })
          .eq("id", editingId);
        if (setErr) throw setErr;

        // delete old questions, re-insert
        await supabase.from("questions").delete().eq("set_id", editingId);
        const toInsert = questions.map((q) => ({
          set_id: editingId,
          question_text: q.text,
          options: JSON.stringify(q.options),
          correct_answer: q.correctAnswer,
        }));
        const { error: qErr } = await supabase
          .from("questions")
          .insert(toInsert);
        if (qErr) throw qErr;

        setSuccess(`✅ Question Set "${formData.title}" updated successfully!`);
      }

      fetchList();
      setTimeout(closeForm, 1800);
    } catch (err) {
      setError(err.message || "Failed to save question set");
    } finally {
      setLoading(false);
    }
  };

  // ── create / update exam ───────────────────────────────────────────────────
  const handleSaveExam = async () => {
    try {
      setLoading(true);
      setError(null);

      if (
        !formData.examTitle ||
        !formData.examDuration ||
        !formData.passingScore ||
        selectedSets.length === 0
      ) {
        setError(
          "Please fill in all required fields and select at least one question set",
        );
        return;
      }

      const selectedSetData = allPublishedSets.filter((s) =>
        selectedSets.includes(s.id),
      );
      const totalQuestions = selectedSetData.reduce(
        (sum, s) => sum + s.question_count,
        0,
      );

      const payload = {
        title: formData.examTitle,
        description: formData.examDescription,
        duration: parseInt(formData.examDuration),
        question_count: totalQuestions,
        passing_score: parseInt(formData.passingScore),
        question_sets: JSON.stringify(selectedSets),
        created_by: user.id,
        status: "published",
      };

      if (mode === "create") {
        const { error: e } = await supabase.from("exams").insert([payload]);
        if (e) throw e;
        setSuccess(`✅ Exam "${formData.examTitle}" created successfully!`);
      } else {
        const { error: e } = await supabase
          .from("exams")
          .update(payload)
          .eq("id", editingId);
        if (e) throw e;
        setSuccess(`✅ Exam "${formData.examTitle}" updated successfully!`);
      }

      fetchList();
      setTimeout(closeForm, 1800);
    } catch (err) {
      setError(err.message || "Failed to save exam");
    } finally {
      setLoading(false);
    }
  };

  // ── delete (optimistic UI) ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setLoading(true);
      const table = confirmDelete.type === "set" ? "question_sets" : "exams";
      const { error: e } = await supabase
        .from(table)
        .delete()
        .eq("id", confirmDelete.id);
      if (e) throw e;

      // Optimistically update UI
      if (confirmDelete.type === "set") {
        setQuestionSets((prev) => prev.filter((s) => s.id !== confirmDelete.id));
      } else {
        setExams((prev) => prev.filter((x) => x.id !== confirmDelete.id));
      }

      setSuccess(`✅ "${confirmDelete.title}" deleted.`);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(err.message || "Failed to delete");
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-primary text-white pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Confirm delete modal */}
        <AnimatePresence>
          {confirmDelete && (
            <ConfirmModal
              message={`This will permanently delete "${confirmDelete.title}". This cannot be undone.`}
              onConfirm={handleDelete}
              onCancel={() => setConfirmDelete(null)}
            />
          )}
        </AnimatePresence>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-600/20 border border-green-500/50 backdrop-blur-sm rounded-lg p-4 mb-4 flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6 text-green-400" />
            <p className="text-green-200">{success}</p>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-accent mb-8"
        >
          Admin Panel
        </motion.h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {["sets", "exams"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                closeForm();
              }}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                activeTab === tab
                  ? "bg-accent text-primary"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {tab === "sets" ? "Question Sets" : "Exams"}
            </button>
          ))}
        </div>

        {/* ── LIST VIEW (no form open) ─────────────────────────────────────── */}
        {mode === null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <Button
                onClick={openCreate}
                variant="primary"
                size="lg"
                className="flex items-center gap-2"
              >
                <Plus size={20} /> Create {activeTab === "sets" ? "Question Set" : "Exam"}
              </Button>
            </div>

            {listLoading ? (
              <LoadingSpinner text="Loading..." />
            ) : activeTab === "sets" ? (
              questionSets.length === 0 ? (
                <GlassCard className="text-center py-10">
                  <BookOpen size={40} className="mx-auto text-white/30 mb-3" />
                  <p className="text-white/60">No question sets yet. Create one!</p>
                </GlassCard>
              ) : (
                <div className="grid gap-4">
                  {questionSets.map((set, i) => (
                    <motion.div
                      key={set.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <GlassCard className="border-accent/20 hover:border-accent/40 transition-all">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-accent truncate">{set.title}</h3>
                            <p className="text-white/60 text-sm">
                              {set.subject} • {set.question_count} questions • {" "}
                              <span className={`font-medium ${set.status === "published" ? "text-green-400" : "text-yellow-400"}`}>
                                {set.status}
                              </span>
                            </p>
                            {set.description && (
                              <p className="text-white/50 text-xs mt-1 truncate">{set.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => openEdit(set)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-sm font-medium transition-all"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  type: "set",
                                  id: set.id,
                                  title: set.title,
                                })
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-200 text-sm font-medium transition-all"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )
            ) : // Exams list
            exams.length === 0 ? (
              <GlassCard className="text-center py-10">
                <ClipboardList size={40} className="mx-auto text-white/30 mb-3" />
                <p className="text-white/60">No exams yet. Create one!</p>
              </GlassCard>
            ) : (
              <div className="grid gap-4">
                {exams.map((exam, i) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <GlassCard className="border-accent/20 hover:border-accent/40 transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-accent truncate">{exam.title}</h3>
                          <p className="text-white/60 text-sm">
                            {exam.duration} min • {exam.question_count} questions • Pass: {exam.passing_score}% • {" "}
                            <span className={`font-medium ${exam.status === "published" ? "text-green-400" : "text-yellow-400"}`}>
                              {exam.status}
                            </span>
                          </p>
                          {exam.description && (
                            <p className="text-white/50 text-xs mt-1 truncate">{exam.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => navigate(`/exam/${exam.id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/30 hover:bg-green-600/50 text-green-200 text-sm font-medium transition-all"
                          >
                            <BookOpen size={14} /> Start
                          </button>
                          <button
                            onClick={() => openEdit(exam)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-sm font-medium transition-all"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: "exam",
                                id: exam.id,
                                title: exam.title,
                              })
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-200 text-sm font-medium transition-all"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── QUESTION SET FORM (create / edit) ───────────────────────────── */}
        {mode !== null && activeTab === "sets" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <GlassCard className="border-accent/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-accent">
                  {mode === "create" ? "Create Question Set" : "Edit Question Set"}
                </h2>
                <button
                  onClick={closeForm}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Physics Basics"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Subject *</label>
                  <input
                    type="text"
                    placeholder="e.g., Physics"
                    value={formData.subject || ""}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                  <textarea
                    placeholder="Description of the question set"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Questions */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-accent">Questions</h3>
              {questions.map((q, idx) => (
                <GlassCard key={q.id} className="border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-accent">Question {idx + 1}</h4>
                    {questions.length > 1 && (
                      <button
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-red-400/70 hover:text-red-400 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Question Text *</label>
                      <textarea
                        value={q.text}
                        onChange={(e) => handleQuestionChange(q.id, "text", e.target.value)}
                        placeholder="Enter question text"
                        rows="2"
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx}>
                          <label className="block text-sm font-medium text-white/80 mb-1">Option {String.fromCharCode(65 + optIdx)} *</label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                            placeholder={`Enter option ${String.fromCharCode(65 + optIdx)}`}
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Correct Answer *</label>
                      <select
                        value={q.correctAnswer}
                        onChange={(e) => handleQuestionChange(q.id, "correctAnswer", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-accent"
                      >
                        <option value="" disabled>Select correct answer</option>
                        {["A", "B", "C", "D"].map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            <Button onClick={handleAddQuestion} variant="secondary" size="md" className="flex items-center gap-2">
              <Plus size={20} /> Add Question
            </Button>

            <div className="flex gap-4">
              <Button onClick={handleSaveSet} variant="primary" size="lg" disabled={loading} className="flex-1">
                {loading ? "Saving..." : mode === "create" ? "Create Question Set" : "Save Changes"}
              </Button>
              <Button onClick={closeForm} variant="secondary" size="lg" className="flex-1">Cancel</Button>
            </div>
          </motion.div>
        )}

        {/* ── EXAM FORM (create / edit) ───────────────────────────────────── */}
        {mode !== null && activeTab === "exams" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <GlassCard className="border-accent/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-accent">{mode === "create" ? "Create Exam" : "Edit Exam"}</h2>
                <button onClick={closeForm} className="text-white/50 hover:text-white transition-colors"><X size={22} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Exam Title *</label>
                  <input type="text" placeholder="e.g., Physics Mid-Term Exam" value={formData.examTitle || ""} onChange={(e) => setFormData({ ...formData, examTitle: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                  <textarea placeholder="Exam description" value={formData.examDescription || ""} onChange={(e) => setFormData({ ...formData, examDescription: e.target.value })} rows="3" className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Duration (minutes) *</label>
                    <input type="number" placeholder="60" value={formData.examDuration || ""} onChange={(e) => setFormData({ ...formData, examDuration: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Passing Score (%) *</label>
                    <input type="number" placeholder="60" value={formData.passingScore || ""} onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent" />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="border-accent/30">
              <h3 className="text-xl font-bold text-accent mb-4">Select Question Sets *</h3>
              {allPublishedSets.length === 0 ? (
                <p className="text-white/60">No question sets available. Create some first!</p>
              ) : (
                <div className="space-y-2">
                  {allPublishedSets.map((set) => (
                    <label key={set.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-white/10">
                      <input type="checkbox" checked={selectedSets.includes(set.id)} onChange={() => toggleSetSelection(set.id)} className="w-4 h-4 cursor-pointer accent-accent" />
                      <div className="flex-1">
                        <p className="font-medium text-white">{set.title}</p>
                        <p className="text-sm text-white/60">{set.subject} • {set.question_count} questions</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </GlassCard>

            <div className="flex gap-4">
              <Button onClick={handleSaveExam} variant="primary" size="lg" disabled={loading} className="flex-1">{loading ? "Saving..." : mode === "create" ? "Create Exam" : "Save Changes"}</Button>
              <Button onClick={closeForm} variant="secondary" size="lg" className="flex-1">Cancel</Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Admin;
