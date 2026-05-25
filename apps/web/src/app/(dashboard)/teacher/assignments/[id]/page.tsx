'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle2, Clock, Star, ChevronLeft,
  ChevronDown, ChevronRight, X, Save
} from 'lucide-react';
import Link from 'next/link';

const assignment = {
  id: '1',
  title: 'Derivatives Practice Set',
  course: 'Advanced Mathematics',
  dueDate: 'May 28, 2026',
  totalPoints: 100,
  submissions: 22,
  enrolled: 28,
  avgScore: 82.4,
};

const questions = [
  { id: 'q1', text: 'Derivative of f(x) = x³ − 4x + 7', type: 'mcq', points: 10, correctAnswer: 'f\'(x) = 3x² − 4' },
  { id: 'q2', text: 'd/dx [sin(x²)]', type: 'mcq', points: 10, correctAnswer: '2x cos(x²)' },
  { id: 'q3', text: 'Derivative of e^(3x)', type: 'mcq', points: 10, correctAnswer: '3e^(3x)' },
  { id: 'q4', text: 'Critical points of f(x) = x³ − 3x² − 9x + 5', type: 'short', points: 35 },
  { id: 'q5', text: 'Related rates – ladder problem', type: 'short', points: 35 },
];

const submissions = [
  {
    id: 's1', student: 'Sarah Johnson', avatar: 'SJ', submittedAt: '2 hours ago',
    score: 95, graded: true, status: 'graded',
    answers: { q1: 'f\'(x) = 3x² − 4', q2: '2x cos(x²)', q3: '3e^(3x)', q4: 'x = 3 (local min), x = −1 (local max)', q5: 'Using Pythagorean theorem: rate = −1.5 m/s' },
  },
  {
    id: 's2', student: 'Ahmed Hassan', avatar: 'AH', submittedAt: '4 hours ago',
    score: 88, graded: true, status: 'graded',
    answers: { q1: 'f\'(x) = 3x² − 4', q2: '2x cos(x²)', q3: '3e^(3x)', q4: 'x = 3 and x = −1 are critical points', q5: 'The rate is −1.5 m/s using chain rule' },
  },
  {
    id: 's3', student: 'Emma Wilson', avatar: 'EW', submittedAt: '5 hours ago',
    score: null, graded: false, status: 'pending',
    answers: { q1: 'f\'(x) = 3x² − 4', q2: 'cos(x²)', q3: '3e^(3x)', q4: 'Setting f\'(x) = 0: 3x² − 6x − 9 = 0', q5: 'dy/dt = −1.5 when x = 6' },
  },
  {
    id: 's4', student: 'James Chen', avatar: 'JC', submittedAt: '6 hours ago',
    score: null, graded: false, status: 'pending',
    answers: { q1: 'f\'(x) = 3x² − 4', q2: '2x cos(x²)', q3: 'e^(3x)', q4: 'x = 3 is the only critical point', q5: '' },
  },
  {
    id: 's5', student: 'Maria Garcia', avatar: 'MG', submittedAt: '8 hours ago',
    score: 71, graded: true, status: 'graded',
    answers: { q1: 'f\'(x) = x² − 4', q2: '2x cos(x²)', q3: '3e^(3x)', q4: 'Critical points at x=3 and x=-1', q5: 'Rate = 1.5 m/s' },
  },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  graded: { label: 'Graded', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  pending: { label: 'Pending Review', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

export default function TeacherAssignmentDetailPage() {
  const [activeSubmission, setActiveSubmission] = useState<typeof submissions[0] | null>(null);
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  function saveGrade(submId: string) {
    setSaved(p => ({ ...p, [submId]: true }));
    setTimeout(() => setSaved(p => ({ ...p, [submId]: false })), 2000);
  }

  function getQScore(submId: string, qId: string, maxPts: number) {
    return scores[submId]?.[qId] ?? maxPts;
  }

  const graded = submissions.filter(s => s.graded).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/teacher/assignments" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-2">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to assignments
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{assignment.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{assignment.course} · Due {assignment.dueDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Submissions', value: `${assignment.submissions}/${assignment.enrolled}`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Graded', value: `${graded}/${assignment.submissions}`, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Pending', value: assignment.submissions - graded, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Avg Score', value: `${assignment.avgScore}%`, icon: Star, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
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

      {/* Submission list */}
      <div className="flex gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Submissions</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {submissions.map(s => (
              <button key={s.id} onClick={() => setActiveSubmission(s)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${
                  activeSubmission?.id === s.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{s.avatar}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{s.student}</p>
                  <p className="text-xs text-slate-400">{s.submittedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.score !== null && <span className="text-sm font-bold text-slate-900 dark:text-white">{s.score}%</span>}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig[s.status].cls}`}>{statusConfig[s.status].label}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grading panel */}
        <AnimatePresence>
          {activeSubmission && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="w-96 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeSubmission.student}</p>
                  <p className="text-xs text-slate-400">{activeSubmission.submittedAt}</p>
                </div>
                <button onClick={() => setActiveSubmission(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {questions.map((q, qi) => (
                  <div key={q.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Q{qi + 1} · {q.points}pts</p>
                      {q.type === 'short' && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={q.points}
                            value={getQScore(activeSubmission.id, q.id, q.points)}
                            onChange={e => setScores(p => ({ ...p, [activeSubmission.id]: { ...p[activeSubmission.id], [q.id]: Number(e.target.value) } }))}
                            className="w-14 text-center text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                          <span className="text-xs text-slate-400">/{q.points}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{q.text}</p>
                    <div className={`p-3 rounded-xl text-xs ${
                      q.type === 'mcq'
                        ? activeSubmission.answers[q.id] === q.correctAnswer
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {activeSubmission.answers[q.id] || <span className="text-slate-400 italic">No answer</span>}
                      {q.type === 'mcq' && (
                        <p className="mt-1 font-semibold">
                          {activeSubmission.answers[q.id] === q.correctAnswer ? '✓ Correct' : `✗ Correct: ${q.correctAnswer}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Feedback to student</label>
                  <textarea
                    rows={3}
                    value={feedbacks[activeSubmission.id] ?? ''}
                    onChange={e => setFeedbacks(p => ({ ...p, [activeSubmission.id]: e.target.value }))}
                    placeholder="Write feedback…"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => saveGrade(activeSubmission.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">
                  <Save className="h-4 w-4" />
                  {saved[activeSubmission.id] ? 'Saved!' : 'Save Grade'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
