'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Clock, Users, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

const STEPS = ['Basic Info', 'Details', 'Settings', 'Review'];

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  subject: z.string().min(1, 'Select a subject'),
  gradeLevel: z.string().min(1, 'Select a grade level'),
  estimatedHours: z.string().optional(),
  maxStudents: z.string().optional(),
  language: z.string().default('English'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});
type FormData = z.infer<typeof schema>;

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'CS', 'Arabic', 'French', 'Art', 'PE'];
const GRADES = ['6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];

export default function NewCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);

  const { register, watch, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'DRAFT', language: 'English' },
  });

  const values = watch();
  const inputCls = 'w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500';

  async function onSubmit(data: FormData) {
    setCreating(true);
    await new Promise(r => setTimeout(r, 1200));
    setCreating(false);
    setDone(true);
    setTimeout(() => router.push('/teacher/courses'), 1500);
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Course Created!</h2>
          <p className="text-slate-500 mt-1">Redirecting to your courses...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Course</h1>
        <p className="text-slate-500 mt-1">Fill in the details to publish your course</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
              i < step ? 'bg-primary-600 text-white' :
              i === step ? 'bg-primary-100 text-primary-600 border-2 border-primary-600' :
              'bg-slate-100 dark:bg-slate-700 text-slate-400'
            }`}>
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${ i === step ? 'text-primary-600' : 'text-slate-400' }`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${ i < step ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700' }`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4"
        >
          {step === 0 && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Course Title *</label>
                <input {...register('title')} placeholder="e.g. Advanced Mathematics" className={inputCls} />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Description *</label>
                <textarea {...register('description')} rows={4} placeholder="What will students learn in this course?" className={`${inputCls} resize-none`} />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Subject *</label>
                <select {...register('subject')} className={inputCls}>
                  <option value="">Select subject</option>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
                {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Grade Level *</label>
                <select {...register('gradeLevel')} className={inputCls}>
                  <option value="">Select grade</option>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
                {errors.gradeLevel && <p className="mt-1 text-xs text-red-500">{errors.gradeLevel.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Estimated Hours</label>
                  <input {...register('estimatedHours')} type="number" placeholder="e.g. 40" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Max Students</label>
                  <input {...register('maxStudents')} type="number" placeholder="e.g. 30" className={inputCls} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Language</label>
                <select {...register('language')} className={inputCls}>
                  <option>English</option>
                  <option>Arabic</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-3">Publish Status</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['DRAFT', 'PUBLISHED'] as const).map(s => (
                    <label key={s} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      values.status === s ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'
                    }`}>
                      <input {...register('status')} type="radio" value={s} className="text-primary-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{s}</p>
                        <p className="text-xs text-slate-400">{s === 'DRAFT' ? 'Save and edit later' : 'Make visible to students'}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Review your course</h3>
              {([
                ['Title', values.title],
                ['Description', values.description],
                ['Subject', values.subject],
                ['Grade Level', values.gradeLevel],
                ['Language', values.language],
                ['Status', values.status],
              ] as const).map(([label, val]) => val ? (
                <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <span className="text-xs text-slate-500 w-24 flex-shrink-0">{label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{val}</span>
                </div>
              ) : null)}
            </div>
          )}
        </motion.div>

        <div className="flex items-center justify-between mt-4">
          <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" disabled={creating}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60">
              {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <><BookOpen className="h-4 w-4" /> Create Course</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
