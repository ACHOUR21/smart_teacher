'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Plus, FileText, Users, Clock, CheckCircle2, ChevronRight, MoreVertical, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const assignments = [
  { id: '1', title: 'Algebra Quiz — Chapter 5', course: 'Advanced Mathematics', type: 'Quiz', status: 'published', submissions: 28, total: 32, due: 'Today 11:59 PM', urgent: true },
  { id: '2', title: "Newton's Laws Essay", course: 'Physics 101', type: 'Essay', status: 'published', submissions: 15, total: 28, due: 'Tomorrow', urgent: false },
  { id: '3', title: 'Lab Report — Titration', course: 'Chemistry', type: 'Report', status: 'published', submissions: 8, total: 20, due: 'In 3 days', urgent: false },
  { id: '4', title: 'Calculus Midterm Exam', course: 'Advanced Mathematics', type: 'Exam', status: 'draft', submissions: 0, total: 32, due: 'Jun 1', urgent: false },
  { id: '5', title: 'Quantum Mechanics Overview', course: 'Physics', type: 'Homework', status: 'closed', submissions: 28, total: 28, due: 'May 10', urgent: false },
]

const typeColors: Record<string, string> = {
  Quiz: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  Essay: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  Report: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  Exam: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  Homework: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
}

export default function TeacherAssignmentsPage() {
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Assignments" subtitle={`${assignments.filter(a=>a.status==='published').length} active`} />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Published', value: assignments.filter(a=>a.status==='published').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            { label: 'Due Today', value: assignments.filter(a=>a.urgent).length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' },
            { label: 'Drafts', value: assignments.filter(a=>a.status==='draft').length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
            { label: 'Pending Review', value: assignments.reduce((s,a)=>s+(a.submissions-Math.floor(a.submissions*0.7)),0), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex gap-3">
          <div className="flex-1" />
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 border border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400 text-sm font-medium rounded-xl hover:bg-primary-50 transition-colors">
            <Sparkles className="w-4 h-4" /> AI Generate
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" /> New Assignment
          </button>
        </div>

        {/* Assignments list */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{a.title}</p>
                    {a.urgent && <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded flex-shrink-0">DUE TODAY</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{a.course}</span>
                    <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-lg', typeColors[a.type])}>{a.type}</span>
                  </div>
                </div>

                {/* Submission progress */}
                <div className="hidden sm:flex items-center gap-3 w-44">
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(a.submissions/a.total)*100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">{a.submissions}/{a.total}</span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className={cn('text-xs', a.urgent ? 'text-red-600 font-semibold' : 'text-slate-400')}>{a.due}</span>
                  </div>
                  {a.status === 'published' ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Live
                    </span>
                  ) : a.status === 'draft' ? (
                    <span className="text-xs font-semibold text-amber-600">Draft</span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Closed</span>
                  )}
                  <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
