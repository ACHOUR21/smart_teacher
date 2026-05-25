import { Header } from '@/components/layout/header'
import { Clock, CheckCircle2, AlertCircle, FileText, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

type Status = 'due' | 'submitted' | 'graded' | 'overdue'

const assignments: Array<{
  id: string; title: string; subject: string; teacher: string;
  due: string; status: Status; score?: string; type: string; urgent?: boolean
}> = [
  { id: '1', title: 'Algebra Quiz — Chapter 5', subject: 'Mathematics', teacher: 'Dr. Mitchell', due: 'Today 11:59 PM', status: 'due', type: 'Quiz', urgent: true },
  { id: '2', title: "Newton's Laws Lab Report", subject: 'Physics', teacher: 'Prof. Cooper', due: 'Tomorrow 6:00 PM', status: 'due', type: 'Report' },
  { id: '3', title: 'Hamlet Essay — Act 3 Analysis', subject: 'Literature', teacher: 'Ms. Davis', due: 'May 28, 2026', status: 'due', type: 'Essay' },
  { id: '4', title: 'WWI Causes Presentation', subject: 'History', teacher: 'Mr. Hassan', due: 'May 22, 2026', status: 'submitted', type: 'Presentation' },
  { id: '5', title: 'Organic Chemistry Worksheet', subject: 'Chemistry', teacher: 'Dr. Ahmadi', due: 'May 20, 2026', status: 'graded', score: '92/100', type: 'Worksheet' },
  { id: '6', title: 'Cell Division Diagram', subject: 'Biology', teacher: 'Dr. Tanaka', due: 'May 15, 2026', status: 'graded', score: '88/100', type: 'Diagram' },
  { id: '7', title: 'Calculus Problem Set', subject: 'Mathematics', teacher: 'Dr. Mitchell', due: 'May 10, 2026', status: 'overdue', type: 'Problem Set' },
]

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  due: { label: 'Due', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', icon: Clock },
  submitted: { label: 'Submitted', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: CheckCircle2 },
  graded: { label: 'Graded', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: CheckCircle2 },
  overdue: { label: 'Overdue', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', icon: AlertCircle },
}

const tabs = ['All', 'Due', 'Submitted', 'Graded'] as const

export default function StudentAssignmentsPage() {
  const pending = assignments.filter((a) => a.status === 'due' || a.status === 'overdue')
  const done = assignments.filter((a) => a.status === 'submitted' || a.status === 'graded')

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Assignments" subtitle={`${pending.length} pending · ${done.length} completed`} />
      <div className="flex-1 p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Due Today', value: assignments.filter(a => a.due.includes('Today')).length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' },
            { label: 'Upcoming', value: assignments.filter(a => a.status === 'due' && !a.due.includes('Today')).length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
            { label: 'Submitted', value: assignments.filter(a => a.status === 'submitted').length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
            { label: 'Graded', value: assignments.filter(a => a.status === 'graded').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-transparent`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Assignment list */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">All Assignments</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {assignments.map((a) => {
              const s = statusConfig[a.status]
              const Icon = s.icon
              return (
                <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{a.title}</p>
                      {a.urgent && <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-md flex-shrink-0">URGENT</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{a.subject} · {a.teacher} · {a.type}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {a.score && <span className="text-sm font-bold text-emerald-600">{a.score}</span>}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className={cn('text-xs font-medium', a.urgent ? 'text-red-600' : 'text-slate-500')}>{a.due}</span>
                    </div>
                    <span className={cn('px-2.5 py-1 text-xs font-semibold rounded-lg', s.bg, s.color)}>
                      <Icon className="w-3 h-3 inline mr-1" />{s.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
