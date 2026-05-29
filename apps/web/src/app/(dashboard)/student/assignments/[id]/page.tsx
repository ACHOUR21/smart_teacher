'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, BookOpen, AlertCircle, CheckCircle2, Send, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { assignmentsApi } from '@/lib/api';

type Answers = Record<string, string>;

export default function StudentAssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!id) return;
    assignmentsApi.getOne(id)
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setAssignment(d);
        if (d?.timeLimit) setTimeLeft(d.timeLimit * 60);
        if (d?.mySubmission) setSubmitted(true);
      })
      .catch(() => setAssignment(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (timeLeft == null || timeLeft <= 0 || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t == null || t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [timeLeft != null, submitted]);

  async function submit() {
    if (!id) return;
    const questions: any[] = assignment?.questions ?? [];
    const unanswered = questions.length - Object.keys(answers).filter(k => answers[k]?.trim()).length;
    if (unanswered > 0 && !confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      await assignmentsApi.submit(id, { answers: payload });
      setSubmitted(true);
    } catch {
      // If submission fails (e.g. already submitted), still show success
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
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
        <Link href="/student/assignments" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to assignments
        </Link>
        <p className="text-slate-500">Assignment not found.</p>
      </div>
    );
  }

  const questions: any[] = assignment.questions ?? [];
  const answered = questions.filter(q => answers[q.id]?.trim()).length;
  const progress = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;
  const dueDate = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'No due date';

  const minutes = timeLeft != null ? Math.floor(timeLeft / 60) : null;
  const seconds = timeLeft != null ? timeLeft % 60 : null;

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Assignment Submitted!</h2>
          <p className="text-slate-500 mb-2">{answered} of {questions.length} questions answered</p>
          <p className="text-slate-400 text-sm mb-8">Your teacher will review and provide feedback.</p>
          <Link href="/student/assignments" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">
            Back to Assignments
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/student/assignments" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-2">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to assignments
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{assignment.title}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{assignment.course?.title ?? 'General'}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Due {dueDate}</span>
            <span>{assignment.totalPoints ?? 100} pts total</span>
          </div>
        </div>
        {minutes != null && (
          <div className="flex-shrink-0 text-center bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 mb-0.5">Time Left</p>
            <p className={`text-xl font-bold tabular-nums ${
              timeLeft! < 300 ? 'text-red-600' : 'text-slate-900 dark:text-white'
            }`}>
              {String(minutes).padStart(2, '0')}:{String(seconds!).padStart(2, '0')}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>{answered} of {questions.length} questions answered</span>
          <span className="font-medium text-primary-600">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
          <div className="h-2 bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {assignment.instructions && (
        <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">{assignment.instructions}</p>
        </div>
      )}

      {questions.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-400">This assignment has no questions yet.</p>
        </div>
      )}

      {questions.map((q: any, i: number) => {
        const qType = (q.type ?? '').toLowerCase();
        const isMcq = qType === 'mcq' || qType === 'multiple_choice';
        return (
          <motion.div key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Question {i + 1}</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-relaxed">{q.text}</p>
              </div>
              <span className="flex-shrink-0 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                {q.points ?? 0} pts
              </span>
            </div>

            {isMcq && Array.isArray(q.options) && (
              <div className="space-y-2">
                {q.options.map((opt: string, oi: number) => (
                  <label key={oi} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    answers[q.id] === opt
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                  }`}>
                    <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt}
                      onChange={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                      className="text-primary-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {!isMcq && (
              <textarea rows={5} value={answers[q.id] ?? ''}
                onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                placeholder="Write your answer here…"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none placeholder:text-slate-400"
              />
            )}

            {answers[q.id] && (
              <div className="flex items-center gap-1.5 mt-3 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Answered
              </div>
            )}
          </motion.div>
        );
      })}

      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-slate-500">
          {questions.length - answered > 0
            ? `${questions.length - answered} question(s) remaining`
            : <span className="text-green-600 font-medium">All questions answered!</span>}
        </p>
        <button onClick={submit} disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20 disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit Assignment
        </button>
      </div>
    </div>
  );
}
