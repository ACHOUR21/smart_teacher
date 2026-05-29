'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle2, Clock, Star, ChevronLeft,
  ChevronRight, X, Save, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { assignmentsApi } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  graded: { label: 'Graded', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

export default function TeacherAssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubmission, setActiveSubmission] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.allSettled([
      assignmentsApi.getOne(id),
      assignmentsApi.getSubmissions(id),
    ]).then(([aRes, sRes]) => {
      if (aRes.status === 'fulfilled') {
        const d = aRes.value.data?.data ?? aRes.value.data;
        setAssignment(d);
      }
      if (sRes.status === 'fulfilled') {
        const d = sRes.value.data;
        setSubmissions(Array.isArray(d) ? d : (d?.data ?? []));
      }
    }).finally(() => setLoading(false));
  }, [id]);

  async function saveGrade(submissionId: string) {
    if (!id) return;
    setSaving(true);
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) ||
      activeSubmission?.score ||
      Math.round((assignment?.totalPoints ?? 100) * 0.8);
    try {
      await assignmentsApi.gradeSubmission(id, submissionId, { score: totalScore, feedback });
      setSubmissions(prev => prev.map(s =>
        s.id === submissionId ? { ...s, score: totalScore, isGraded: true, feedback } : s
      ));
      setSavedId(submissionId);
      setTimeout(() => setSavedId(null), 2000);
    } finally {
      setSaving(false);
    }
  }

  function openSubmission(sub: any) {
    setActiveSubmission(sub);
    setFeedback(sub.feedback ?? '');
    setScores({});
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="space-y-4">
        <Link href="/teacher/assignments" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to assignments
        </Link>
        <p className="text-slate-500">Assignment not found.</p>
      </div>
    );
  }

  const graded = submissions.filter(s => s.isGraded || s.score != null).length;
  const avgScore = graded > 0
    ? Math.round(submissions.filter(s => s.score != null).reduce((sum, s) => sum + s.score, 0) / graded)
    : null;
  const dueDate = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No due date';

  const questions: any[] = assignment.questions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/teacher/assignments" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-2">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to assignments
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{assignment.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{assignment.course?.title ?? 'General'} · Due {dueDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Submissions', value: submissions.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Graded', value: graded, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Pending', value: submissions.length - graded, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Avg Score', value: avgScore != null ? `${avgScore}%` : '—', icon: Star, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Submission list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Submissions</h2>
          </div>
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No submissions yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {submissions.map(sub => {
                const isGraded = sub.isGraded || sub.score != null;
                const statusKey = isGraded ? 'graded' : 'pending';
                const initials = (sub.student?.name ?? sub.student?.email ?? 'S')
                  .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <button key={sub.id} onClick={() => openSubmission(sub)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${
                      activeSubmission?.id === sub.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {sub.student?.name ?? sub.student?.email ?? 'Student'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Submitted'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.score != null && <span className="text-sm font-bold text-slate-900 dark:text-white">{sub.score}%</span>}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[statusKey].cls}`}>
                        {STATUS_CONFIG[statusKey].label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Grading panel */}
        <AnimatePresence>
          {activeSubmission && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="w-96 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {activeSubmission.student?.name ?? activeSubmission.student?.email ?? 'Student'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {activeSubmission.submittedAt ? new Date(activeSubmission.submittedAt).toLocaleString() : 'Submitted'}
                  </p>
                </div>
                <button onClick={() => setActiveSubmission(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {questions.length > 0 ? (
                  questions.map((q: any, qi: number) => {
                    const qType = (q.type ?? '').toLowerCase();
                    const isShort = qType === 'short' || qType === 'short_answer' || qType === 'essay';
                    const studentAnswer = activeSubmission.answers?.find?.((a: any) => a.questionId === q.id)?.answer ?? '';
                    const isCorrect = !isShort && q.correctAnswer && studentAnswer === q.correctAnswer;
                    return (
                      <div key={q.id} className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Q{qi + 1} · {q.points ?? 0}pts</p>
                          {isShort && (
                            <div className="flex items-center gap-1">
                              <input
                                type="number" min={0} max={q.points ?? 100}
                                value={scores[q.id] ?? (activeSubmission.score != null ? Math.round(activeSubmission.score * (q.points ?? 100) / 100) : q.points ?? 0)}
                                onChange={e => setScores(p => ({ ...p, [q.id]: Number(e.target.value) }))}
                                className="w-14 text-center text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              />
                              <span className="text-xs text-slate-400">/{q.points ?? 100}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{q.text}</p>
                        <div className={`p-3 rounded-xl text-xs ${
                          !isShort
                            ? isCorrect
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {studentAnswer || <span className="text-slate-400 italic">No answer</span>}
                          {!isShort && q.correctAnswer && (
                            <p className="mt-1 font-semibold">
                              {isCorrect ? '✓ Correct' : `✗ Correct: ${q.correctAnswer}`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">No question details available.</p>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Feedback to student</label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Write feedback…"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Overall Score</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={0} max={assignment.totalPoints ?? 100}
                      value={
                        Object.values(scores).length > 0
                          ? Object.values(scores).reduce((a, b) => a + b, 0)
                          : (activeSubmission.score ?? '')
                      }
                      onChange={e => {
                        const v = Number(e.target.value);
                        setScores({ '__total__': v });
                      }}
                      placeholder="0"
                      className="w-20 text-center text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <span className="text-sm text-slate-400">/ {assignment.totalPoints ?? 100}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => saveGrade(activeSubmission.id)}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savedId === activeSubmission.id ? 'Saved!' : 'Save Grade'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
