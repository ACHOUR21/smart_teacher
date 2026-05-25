'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Plus, Search, BookOpen, Users, Clock, MoreVertical, Eye, Edit, Archive, CheckCircle2 } from 'lucide-react'

const courses = [
  { id: '1', title: 'Advanced Mathematics', subject: 'Mathematics', status: 'published', students: 32, lessons: 48, updatedAt: '2h ago', color: 'from-blue-500 to-cyan-400', completion: 85 },
  { id: '2', title: 'Physics 101', subject: 'Physics', status: 'published', students: 28, lessons: 36, updatedAt: '1d ago', color: 'from-violet-500 to-purple-400', completion: 62 },
  { id: '3', title: 'Advanced Physics — Quantum Mechanics', subject: 'Physics', status: 'draft', students: 0, lessons: 12, updatedAt: '3d ago', color: 'from-indigo-500 to-blue-400', completion: 25 },
  { id: '4', title: 'Chemistry Fundamentals', subject: 'Chemistry', status: 'published', students: 20, lessons: 44, updatedAt: '5d ago', color: 'from-emerald-500 to-green-400', completion: 90 },
  { id: '5', title: 'Statistics & Probability', subject: 'Mathematics', status: 'draft', students: 0, lessons: 8, updatedAt: '1w ago', color: 'from-amber-500 to-orange-400', completion: 17 },
]

const statusChip = (status: string) => (
  status === 'published'
    ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-lg"><CheckCircle2 className="w-3 h-3" /> Published</span>
    : <span className="text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-1 rounded-lg">Draft</span>
)

export default function TeacherCoursesPage() {
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', subject: '', grade: '' })

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="My Courses" subtitle={`${courses.length} courses · ${courses.filter(c => c.status === 'published').length} published`} />
      <div className="flex-1 p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input placeholder="Search courses..." className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none" />
          </div>
          <div className="flex-1" />
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> New Course
          </button>
        </div>

        {/* New course form */}
        {showNew && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Create New Course</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Subject</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {['Mathematics','Physics','Chemistry','Biology','English','History','CS','Art'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Course Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Advanced Mathematics — Calculus" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button className="px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">Create & Open Builder</button>
            </div>
          </div>
        )}

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((c) => (
            <div key={c.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card border border-slate-100 dark:border-slate-700 card-hover group">
              <div className={`h-1.5 bg-gradient-to-r ${c.color}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.subject}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-0.5 leading-snug truncate">{c.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {statusChip(c.status)}
                    <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.students} students</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{c.lessons} lessons</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Updated {c.updatedAt}</span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Content completion</span>
                    <span>{c.completion}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                    <div className={`h-full bg-gradient-to-r ${c.color} rounded-full`} style={{ width: `${c.completion}%` }} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl transition-colors">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary-700 bg-primary-50 dark:bg-primary-950/40 dark:text-primary-400 hover:bg-primary-100 rounded-xl transition-colors">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
