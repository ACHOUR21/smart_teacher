'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Heart, Shield,
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ROLE_REDIRECTS } from '@/lib/constants';

const STEPS = [
  { id: 'welcome', title: 'Welcome to EduAI', subtitle: 'The AI-powered platform for smarter education' },
  { id: 'role', title: 'What describes you best?', subtitle: 'We\'ll personalise your experience' },
  { id: 'interests', title: 'What are you interested in?', subtitle: 'Choose subjects that excite you' },
  { id: 'goals', title: 'What are your goals?', subtitle: 'Help us understand what success looks like' },
  { id: 'done', title: 'You\'re all set!', subtitle: 'Your personalised dashboard is ready' },
];

const ROLES = [
  { id: 'STUDENT', label: 'Student', icon: GraduationCap, desc: 'I want to learn and grow', color: 'from-blue-500 to-blue-600' },
  { id: 'TEACHER', label: 'Teacher', icon: BookOpen, desc: 'I teach and create courses', color: 'from-green-500 to-green-600' },
  { id: 'PARENT', label: 'Parent', icon: Heart, desc: 'I monitor my child\'s progress', color: 'from-purple-500 to-purple-600' },
  { id: 'ADMIN', label: 'Admin', icon: Shield, desc: 'I manage the platform', color: 'from-slate-500 to-slate-600' },
];

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English Literature', 'History', 'Geography', 'Computer Science',
  'Arabic', 'French', 'Art & Design', 'Physical Education',
];

const GOALS = [
  { id: 'grades', label: 'Improve my grades' },
  { id: 'career', label: 'Prepare for my career' },
  { id: 'skills', label: 'Learn new skills' },
  { id: 'exams', label: 'Prepare for exams' },
  { id: 'curiosity', label: 'Learn out of curiosity' },
  { id: 'support', label: 'Support my students' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(user?.role ?? '');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  function toggleSubject(s: string) {
    setSubjects(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  }

  function toggleGoal(g: string) {
    setGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);
  }

  function finish() {
    const roleKey = role.toLowerCase() as keyof typeof ROLE_REDIRECTS;
    router.push(ROLE_REDIRECTS[roleKey] ?? '/student');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700">
        <motion.div
          className="h-full bg-primary-600"
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8"
          >
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i <= step ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                  } ${i === step ? 'w-8' : 'w-4'}`}
                />
              ))}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{current.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{current.subtitle}</p>

            {/* Step content */}
            {step === 0 && (
              <div className="text-center py-4">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  EduAI combines the power of artificial intelligence with personalised learning to help
                  students achieve their full potential. Teachers save hours of prep time, parents stay
                  informed, and administrators get complete platform visibility.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      role === r.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-md`}>
                      <r.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{r.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                    </div>
                    {role === r.id && <CheckCircle2 className="h-4 w-4 text-primary-600" />}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSubject(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      subjects.includes(s)
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-primary-50'
                    }`}
                  >
                    {subjects.includes(s) && '✓ '}{s}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                      goals.includes(g.id)
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-primary-50'
                    }`}
                  >
                    {goals.includes(g.id) && <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
                    {g.label}
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-4">
                <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <div className="space-y-3 text-left">
                  {role && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <span className="text-sm text-slate-500">Role:</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{role.toLowerCase()}</span>
                    </div>
                  )}
                  {subjects.length > 0 && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <p className="text-sm text-slate-500 mb-2">Interests:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {subjects.map(s => (
                          <span key={s} className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={isFirst}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 disabled:opacity-0 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => isLast ? finish() : setStep(s => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20"
              >
                {isLast ? 'Go to Dashboard' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
