'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, ArrowRight, Plus, Trash2, Wand2,
  CheckCircle2, Loader2, BookOpen, Clock, Award,
  AlignLeft, CheckSquare
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { assignmentsApi, aiApi } from '@/lib/api';

const STEPS = ['Details', 'Questions', 'Settings', 'Review'];

const detailsSchema = z.object({
  title: z.string().min(3, 'Title required'),
  description: z.string().min(10, 'Description required'),
  courseId: z.string().min(1, 'Select a course'),
  dueDate: z.string().min(1, 'Due date required'),
  totalPoints: z.coerce.number().min(1).max(1000),
});

const questionSchema = z.object({
  type: z.enum(['MCQ', 'TEXT']),
  text: z.string().min(3, 'Question text required'),
  points: z.coerce.number().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
});

const MOCK_COURSES = [
  { id: 'c1', title: 'Advanced Mathematics' },
  { id: 'c2', title: 'Computer Science 101' },
  { id: 'c3', title: 'Physics Fundamentals' },
];

export default function NewAssignmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<any[]>([
    { type: 'MCQ', text: '', points: 10, options: ['', '', '', ''], correctAnswer: '' },
  ]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, getValues, watch, formState: { errors } } = useForm({
    resolver: zodResolver(detailsSchema),
    defaultValues: { totalPoints: 100 },
  });

  const addQuestion = (type: 'MCQ' | 'TEXT') => {
    setQuestions((prev) => [
      ...prev,
      type === 'MCQ'
        ? { type: 'MCQ', text: '', points: 10, options: ['', '', '', ''], correctAnswer: '' }
        : { type: 'TEXT', text: '', points: 20 },
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...(q.options ?? [])];
      opts[oIdx] = value;
      return { ...q, options: opts };
    }));
  };

  const generateWithAI = async () => {
    const title = getValues('title');
    if (!title) { toast.error('Enter an assignment title first'); return; }
    setGeneratingAI(true);
    try {
      const res = await aiApi.generateQuiz({ topic: title, count: 5 });
      const generated = res.data?.questions ?? [];
      if (generated.length) {
        setQuestions(generated.map((q: any) => ({
          type: q.type ?? 'MCQ',
          text: q.text ?? q.question ?? '',
          points: q.points ?? 10,
          options: q.options ?? ['', '', '', ''],
          correctAnswer: q.correctAnswer ?? q.answer ?? '',
        })));
        toast.success('AI generated questions!');
      }
    } catch {
      // fallback mock
      setQuestions([
        { type: 'MCQ', text: `What is the main concept of ${title}?`, points: 10, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 'Option A' },
        { type: 'MCQ', text: 'Which of the following best describes the process?', points: 10, options: ['First option', 'Second option', 'Third option', 'Fourth option'], correctAnswer: 'Second option' },
        { type: 'TEXT', text: `Explain the significance of ${title} in your own words.`, points: 20 },
        { type: 'MCQ', text: 'What is the correct formula?', points: 10, options: ['A = πr²', 'A = 2πr', 'A = πd', 'A = r²'], correctAnswer: 'A = πr²' },
        { type: 'TEXT', text: 'Provide an example and solve it step by step.', points: 30 },
      ]);
      toast.success('AI generated questions (demo mode)');
    } finally {
      setGeneratingAI(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await assignmentsApi.create({ ...data, questions });
      toast.success('Assignment created!');
      router.push('/teacher/assignments');
    } catch {
      toast.error('Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/teacher/assignments" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Assignment</h1>
          <p className="text-sm text-gray-500">Create a new assignment for your students</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${
              i === step ? 'text-primary-600' : i < step ? 'text-green-600' : 'text-gray-400'
            }`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${ i < step ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Details */}
        {step === 0 && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-5"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white">Assignment Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input {...register('title')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Chapter 4 Quiz" />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Instructions for students..." />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message as string}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                <select {...register('courseId')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select course</option>
                  {MOCK_COURSES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                {errors.courseId && <p className="mt-1 text-xs text-red-500">{errors.courseId.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input {...register('dueDate')} type="datetime-local" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate.message as string}</p>}
              </div>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Points</label>
              <input {...register('totalPoints')} type="number" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex justify-end">
              <button onClick={handleSubmit(() => setStep(1))} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Questions */}
        {step === 1 && (
          <motion.div key="questions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Questions ({questions.length})</h2>
              <button onClick={generateWithAI} disabled={generatingAI}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors">
                {generatingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Generate with AI
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-sm font-bold flex items-center justify-center">{qIdx + 1}</span>
                    <select value={q.type} onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none">
                      <option value="MCQ">Multiple Choice</option>
                      <option value="TEXT">Written Answer</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-gray-400" />
                      <input type="number" value={q.points} onChange={(e) => updateQuestion(qIdx, 'points', +e.target.value)}
                        className="w-14 text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none" />
                      <span className="text-xs text-gray-400">pts</span>
                    </div>
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(qIdx)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <textarea value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                  placeholder="Enter your question here…" rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {q.type === 'MCQ' && (
                  <div className="space-y-2">
                    {(q.options ?? []).map((opt: string, oIdx: number) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qIdx}`} checked={q.correctAnswer === opt}
                          onChange={() => updateQuestion(qIdx, 'correctAnswer', opt)}
                          className="accent-primary-600" title="Mark as correct" />
                        <input value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    ))}
                    <p className="text-xs text-gray-400">Click radio to mark correct answer</p>
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-2">
              <button onClick={() => addQuestion('MCQ')} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CheckSquare className="w-4 h-4 text-primary-500" /> Add MCQ
              </button>
              <button onClick={() => addQuestion('TEXT')} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <AlignLeft className="w-4 h-4 text-accent-500" /> Add Written
              </button>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Back</button>
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Settings */}
        {step === 2 && (
          <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-5"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white">Settings</h2>
            {[{
              label: 'Allow late submissions',
              desc: 'Students can submit after the due date',
              key: 'allowLate',
            }, {
              label: 'Shuffle questions',
              desc: 'Randomize question order for each student',
              key: 'shuffle',
            }, {
              label: 'Show correct answers after submission',
              desc: 'Students see the correct answers once graded',
              key: 'showAnswers',
            }].map((s) => (
              <div key={s.key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                </div>
                <button className="w-10 h-6 rounded-full bg-primary-600 transition-colors relative flex-shrink-0 mt-0.5">
                  <span className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                </button>
              </div>
            ))}
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Back</button>
              <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Review</h2>
              <div className="space-y-3">
                {[{ icon: BookOpen, label: 'Title', value: getValues('title') },
                  { icon: Clock, label: 'Due Date', value: getValues('dueDate') },
                  { icon: Award, label: 'Total Points', value: `${getValues('totalPoints')} pts` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Questions</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{questions.length} question{questions.length !== 1 ? 's' : ''} · {questions.reduce((s, q) => s + (+q.points || 0), 0)} pts total</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Back</button>
              <button onClick={handleSubmit(onSubmit)} disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-60 transition-colors">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Publish Assignment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
