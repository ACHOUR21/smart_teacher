'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import {
  Plus, FileText, Clock, CheckCircle2,
  ChevronRight, MoreVertical, Sparkles, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { assignmentsApi } from '@/lib/api'
import { toast } from 'sonner'

interface Assignment {
  id: string
  title: string
  type?: string
  dueDate?: string
  isPublished?: boolean
  status?: string
  course?: { title: string }
  _count?: { submissions?: number }
  maxStudents?: number
}

const TYPE_COLORS: Record<string, string> = {
  Quiz: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  Essay: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  Report: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  Exam: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  Homework: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
}

function isUrgent(dueDate?: string) {
  if (!dueDate) return false
  const diff = new Date(dueDate).getTime() - Date.now()
  return diff > 0 && diff < 24 * 60 * 60 * 1000
}

function dueDateLabel(dueDate?: string) {
  if (!dueDate) return 'No due date'
  const d = new Date(dueDate)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  if (diff < 0) return 'Past due'
  if (diff < 24 * 60 * 60 * 1000) return 'Due today'
  if (diff < 2 * 24 * 60 * 60 * 1000) return 'Due tomorrow'
  return d.toLocaleDateString()
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    assignmentsApi.getAll()
      .then((r) => setAssignments(r.data ?? []))
      .catch(() => toast.error('Failed to load assignments'))
      .finally(() => setLoading(false))
  }, [])

  const published = assignments.filter((a) => a.isPublished || a.status === 'published').length
  const dueToday = assignments.filter((a) => isUrgent(a.dueDate)).length
  const drafts = assignments.filter((a) => !a.isPublished && a.status !== 'closed').length
  const pendingReview = assignments.reduce((s, a) => s + (a._count?.submissions ?? 0), 0)

  const stats = [
    { label: 'Published', value: published, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Due Today', value: dueToday, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' },
    { label: 'Drafts', value: drafts, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Total Submissions', value: pendingReview, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  ]

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header
        title="Assignments"
        subtitle={loading ? 'Loading…' : `${published} active`}
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              {loading
                ? <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-1" />
                : <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              }
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 justify-end">
          <Link
            href="/teacher/ai-studio"
            className="flex items-center gap-2 px-4 py-2.5 border border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400 text-sm font-medium rounded-xl hover:bg-primary-50 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> AI Generate
          </Link>
          <Link
            href="/teacher/assignments/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> New Assignment
          </Link>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-slate-600 dark:text-slate-300">No assignments yet</p>
              <p className="text-sm mt-1">Create your first assignment</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {assignments.map((a) => {
                const urgent = isUrgent(a.dueDate)
                const submissionCount = a._count?.submissions ?? 0
                const isPub = a.isPublished || a.status === 'published'
                const isClosed = a.status === 'closed'
                return (
                  <Link
                    key={a.id}
                    href={`/teacher/assignments/${a.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{a.title}</p>
                        {urgent && <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded flex-shrink-0">DUE TODAY</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{a.course?.title ?? '—'}</span>
                        {a.type && (
                          <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-lg', TYPE_COLORS[a.type] ?? 'bg-slate-100 text-slate-600')}>
                            {a.type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Submission count */}
                    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 w-24">
                      <FileText className="w-3.5 h-3.5" />
                      {submissionCount} submitted
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className={cn('text-xs', urgent ? 'text-red-600 font-semibold' : 'text-slate-400')}>
                          {dueDateLabel(a.dueDate)}
                        </span>
                      </div>
                      {isClosed ? (
                        <span className="text-xs font-semibold text-slate-400">Closed</span>
                      ) : isPub ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Live
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600">Draft</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
