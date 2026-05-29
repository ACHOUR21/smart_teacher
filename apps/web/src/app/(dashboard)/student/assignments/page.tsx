'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Clock, CheckCircle2, AlertCircle, FileText, ChevronRight, Calendar, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { assignmentsApi } from '@/lib/api'
import { toast } from 'sonner'

interface Assignment {
  id: string
  title: string
  type?: string
  dueDate?: string
  isPublished?: boolean
  course?: { title: string; subject?: string }
  submissions?: Array<{ grade?: number | null }>
  _count?: { submissions?: number }
}

type Status = 'due' | 'submitted' | 'graded' | 'overdue'

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  due: { label: 'Due', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', icon: Clock },
  submitted: { label: 'Submitted', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: CheckCircle2 },
  graded: { label: 'Graded', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: CheckCircle2 },
  overdue: { label: 'Overdue', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', icon: AlertCircle },
}

function getStatus(a: Assignment): Status {
  const sub = a.submissions?.[0]
  if (sub) {
    return sub.grade != null ? 'graded' : 'submitted'
  }
  if (!a.dueDate) return 'due'
  const diff = new Date(a.dueDate).getTime() - Date.now()
  return diff < 0 ? 'overdue' : 'due'
}

function isUrgent(a: Assignment) {
  if (!a.dueDate) return false
  const diff = new Date(a.dueDate).getTime() - Date.now()
  return diff > 0 && diff < 24 * 60 * 60 * 1000
}

function dueDateLabel(dueDate?: string) {
  if (!dueDate) return 'No due date'
  const d = new Date(dueDate)
  const diff = d.getTime() - Date.now()
  if (diff < 0) return 'Past due'
  if (diff < 24 * 60 * 60 * 1000) return 'Today'
  if (diff < 2 * 24 * 60 * 60 * 1000) return 'Tomorrow'
  return d.toLocaleDateString()
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    assignmentsApi.getMyAssignments()
      .then((r) => setAssignments(r.data ?? []))
      .catch(() => toast.error('Failed to load assignments'))
      .finally(() => setLoading(false))
  }, [])

  const withStatus = assignments.map((a) => ({ ...a, _status: getStatus(a), _urgent: isUrgent(a) }))

  const dueToday = withStatus.filter((a) => a._urgent).length
  const upcoming = withStatus.filter((a) => a._status === 'due' && !a._urgent).length
  const submitted = withStatus.filter((a) => a._status === 'submitted').length
  const graded = withStatus.filter((a) => a._status === 'graded').length

  const stats = [
    { label: 'Due Today', value: dueToday, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' },
    { label: 'Upcoming', value: upcoming, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Submitted', value: submitted, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Graded', value: graded, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  ]

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header
        title="Assignments"
        subtitle={loading ? 'Loading…' : `${withStatus.filter((a) => a._status === 'due' || a._status === 'overdue').length} pending · ${submitted + graded} completed`}
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-transparent`}>
              {loading
                ? <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-1" />
                : <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              }
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Assignment list */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">All Assignments</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-slate-600 dark:text-slate-300">No assignments yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {withStatus.map((a) => {
                const s = STATUS_CONFIG[a._status]
                const Icon = s.icon
                const sub = a.submissions?.[0]
                const score = sub?.grade != null ? `${sub.grade}/100` : null
                return (
                  <Link
                    key={a.id}
                    href={`/student/assignments/${a.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{a.title}</p>
                        {a._urgent && (
                          <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-md flex-shrink-0">URGENT</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {a.course?.subject ?? a.course?.title ?? '—'}
                        {a.type ? ` · ${a.type}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {score && <span className="text-sm font-bold text-emerald-600">{score}</span>}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className={cn('text-xs font-medium', a._urgent ? 'text-red-600' : 'text-slate-500')}>
                          {dueDateLabel(a.dueDate)}
                        </span>
                      </div>
                      <span className={cn('px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1', s.bg, s.color)}>
                        <Icon className="w-3 h-3" />{s.label}
                      </span>
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
