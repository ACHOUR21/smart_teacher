'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, AlertCircle, CheckCircle2, Send, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const assignment = {
  id: '1',
  title: 'Derivatives Practice Set',
  course: 'Advanced Mathematics',
  teacher: 'Mr. Al-Rashid',
  dueDate: 'May 28, 2026 · 11:59 PM',
  totalPoints: 100,
  timeLimit: 60,
  instructions: 'Answer all questions. Show your work where applicable. MCQ questions are auto-graded. Written answers will be reviewed by your teacher.',
  questions: [
    {
      id: 'q1',
      type: 'mcq',
      text: 'What is the derivative of f(x) = x³ − 4x + 7?',
      points: 10,
      options: [
        'f\'(x) = 3x² − 4',
        'f\'(x) = 3x² + 7',
        'f\'(x) = x² − 4',
        'f\'(x) = 3x³ − 4',
      ],
    },
    {
      id: 'q2',
      type: 'mcq',
      text: 'Using the chain rule, find d/dx [sin(x²)].',
      points: 10,
      options: [
        '2x cos(x²)',
        'cos(x²)',
        '−2x cos(x²)',
        '2x sin(x²)',
      ],
    },
    {
      id: 'q3',
      type: 'mcq',
      text: 'What is the derivative of e^(3x)?',
      points: 10,
      options: [
        '3e^(3x)',
        'e^(3x)',
        '3xe^(3x)',
        '(1/3)e^(3x)',
      ],
    },
    {
      id: 'q4',
      type: 'short',
      text: 'Find the critical points of f(x) = x³ − 3x² − 9x + 5 and classify each as a local max, local min, or saddle point.',
      points: 35,
    },
    {
      id: 'q5',
      type: 'short',
      text: 'A ladder 10 meters long leans against a wall. The bottom of the ladder slides away at 2 m/s. How fast is the top of the ladder sliding down when the bottom is 6 meters from the wall?',
      points: 35,
    },
  ],
};

type Answers = Record<string, string>;

export default function StudentAssignmentPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft] = useState(assignment.timeLimit * 60);

  const answered = Object.keys(answers).filter(k => answers[k]?.trim()).length;
  const progress = Math.round((answered / assignment.questions.length) * 100);

  function setAnswer(qId: string, val: string) {
    setAnswers(p => ({ ...p, [qId]: val }));
  }

  function submit() {
    if (answered < assignment.questions.length) {
      if (!confirm(`You have ${assignment.questions.length - answered} unanswered question(s). Submit anyway?`)) return;
    }
    setSubmitted(true);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Assignment Submitted!</h2>
          <p className="text-slate-500 mb-2">{answered} of {assignment.questions.length} questions answered</p>
          <p className="text-slate-400 text-sm mb-8">Your teacher will review your submission and provide feedback.</p>
          <Link href="/student/assignments" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">
            Back to Assignments
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/student/assignments" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-2">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to assignments
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{assignment.title}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{assignment.course}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Due {assignment.dueDate}</span>
            <span>{assignment.totalPoints} pts total</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-center bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 mb-0.5">Time Left</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>{answered} of {assignment.questions.length} questions answered</span>
          <span className="font-medium text-primary-600">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
          <div className="h-2 bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Instructions */}
      <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">{assignment.instructions}</p>
      </div>

      {/* Questions */}
      {assignment.questions.map((q, i) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Question {i + 1}</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-relaxed">{q.text}</p>
            </div>
            <span className="flex-shrink-0 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
              {q.points} pts
            </span>
          </div>

          {q.type === 'mcq' && q.options && (
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    answers[q.id] === opt
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswer(q.id, opt)}
                    className="text-primary-600"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === 'short' && (
            <textarea
              rows={5}
              value={answers[q.id] ?? ''}
              onChange={e => setAnswer(q.id, e.target.value)}
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
      ))}

      {/* Submit */}
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-slate-500">
          {assignment.questions.length - answered > 0
            ? `${assignment.questions.length - answered} question(s) remaining`
            : <span className="text-green-600 font-medium">All questions answered!</span>}
        </p>
        <button
          onClick={submit}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20"
        >
          <Send className="h-4 w-4" /> Submit Assignment
        </button>
      </div>
    </div>
  );
}
