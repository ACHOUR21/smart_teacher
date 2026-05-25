import { Header } from '@/components/layout/header'
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'

const children = [
  {
    name: 'Lina Johnson', grade: 'Grade 9', color: 'from-violet-500 to-purple-400',
    stats: { present: 87, absent: 4, late: 3, excused: 2, total: 96 },
    records: [
      { date: 'Mon, May 25', subject: 'Mathematics', status: 'present', time: '8:00 AM' },
      { date: 'Mon, May 25', subject: 'Physics', status: 'present', time: '10:00 AM' },
      { date: 'Mon, May 25', subject: 'English', status: 'late', time: '1:05 PM' },
      { date: 'Fri, May 23', subject: 'History', status: 'absent', time: '—' },
      { date: 'Fri, May 23', subject: 'Chemistry', status: 'present', time: '2:00 PM' },
    ],
  },
  {
    name: 'Omar Johnson', grade: 'Grade 6', color: 'from-blue-500 to-cyan-400',
    stats: { present: 79, absent: 8, late: 5, excused: 4, total: 96 },
    records: [
      { date: 'Mon, May 25', subject: 'Science', status: 'present', time: '8:00 AM' },
      { date: 'Mon, May 25', subject: 'Mathematics', status: 'absent', time: '—' },
      { date: 'Fri, May 23', subject: 'English', status: 'present', time: '9:00 AM' },
      { date: 'Fri, May 23', subject: 'Art', status: 'excused', time: '—' },
    ],
  },
]

const statusIcon = (s: string) => {
  if (s === 'present') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  if (s === 'absent') return <XCircle className="w-4 h-4 text-red-500" />
  if (s === 'late') return <Clock className="w-4 h-4 text-amber-500" />
  return <Clock className="w-4 h-4 text-blue-400" />
}

export default function ParentAttendancePage() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Attendance" subtitle="Track your children's attendance" />
      <div className="flex-1 p-6 space-y-6">
        {children.map((child) => {
          const pct = Math.round((child.stats.present / child.stats.total) * 100)
          return (
            <div key={child.name} className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${child.color}`} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${child.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {child.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{child.name}</h3>
                    <p className="text-xs text-slate-500">{child.grade}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-3xl font-bold gradient-text">{pct}%</p>
                    <p className="text-xs text-slate-400">attendance rate</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Present', value: child.stats.present, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                    { label: 'Absent', value: child.stats.absent, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' },
                    { label: 'Late', value: child.stats.late, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
                    { label: 'Excused', value: child.stats.excused, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Records</h4>
                <div className="space-y-2">
                  {child.records.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      {statusIcon(r.status)}
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.subject}</span>
                        <span className="text-xs text-slate-400 ml-2">{r.date}</span>
                      </div>
                      <span className="text-xs text-slate-400">{r.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
