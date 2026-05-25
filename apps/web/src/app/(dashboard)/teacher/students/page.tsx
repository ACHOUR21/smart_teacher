import { Header } from '@/components/layout/header'
import { Search, Filter, Mail, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react'

const students = [
  { id: '1', name: 'Alex Johnson', email: 'alex@school.edu', grade: '89%', attendance: '96%', courses: 3, lastActive: '2h ago', trend: 'up', status: 'active' },
  { id: '2', name: 'Maria Santos', email: 'maria@school.edu', grade: '94%', attendance: '99%', courses: 3, lastActive: '1h ago', trend: 'up', status: 'active' },
  { id: '3', name: 'Youssef Amrani', email: 'y.amrani@school.edu', grade: '76%', attendance: '88%', courses: 2, lastActive: '3d ago', trend: 'down', status: 'at-risk' },
  { id: '4', name: 'Sophie Laurent', email: 'sophie@school.edu', grade: '91%', attendance: '97%', courses: 3, lastActive: '4h ago', trend: 'stable', status: 'active' },
  { id: '5', name: 'Omar Hassan', email: 'omar@school.edu', grade: '68%', attendance: '82%', courses: 2, lastActive: '1w ago', trend: 'down', status: 'at-risk' },
  { id: '6', name: 'Priya Patel', email: 'priya@school.edu', grade: '97%', attendance: '100%', courses: 3, lastActive: '30m ago', trend: 'up', status: 'active' },
  { id: '7', name: 'Lucas Blanc', email: 'lucas@school.edu', grade: '83%', attendance: '93%', courses: 3, lastActive: '6h ago', trend: 'stable', status: 'active' },
  { id: '8', name: 'Fatima Al-Rashid', email: 'fatima@school.edu', grade: '88%', attendance: '95%', courses: 2, lastActive: '2d ago', trend: 'up', status: 'active' },
]

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-500" />
  return <Minus className="w-3.5 h-3.5 text-slate-400" />
}

export default function TeacherStudentsPage() {
  const atRisk = students.filter((s) => s.status === 'at-risk')

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Students" subtitle={`${students.length} students · ${atRisk.length} need attention`} />
      <div className="flex-1 p-6 space-y-6">
        {/* At-risk alert */}
        {atRisk.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-400 text-sm">{atRisk.length} students need attention</p>
              <p className="text-sm text-amber-700 dark:text-amber-500">{atRisk.map(s => s.name).join(', ')} — declining grades or low attendance.</p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input placeholder="Search students..." className="flex-1 text-sm bg-transparent placeholder:text-slate-400 focus:outline-none" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Student table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['Student', 'Grade', 'Attendance', 'Courses', 'Trend', 'Last Active', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-bold ${ parseFloat(s.grade) >= 90 ? 'text-emerald-600' : parseFloat(s.grade) >= 80 ? 'text-blue-600' : parseFloat(s.grade) >= 70 ? 'text-amber-600' : 'text-red-500'}`}>
                        {s.grade}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{s.attendance}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{s.courses}</td>
                    <td className="px-5 py-4"><TrendIcon trend={s.trend} /></td>
                    <td className="px-5 py-4 text-xs text-slate-400">{s.lastActive}</td>
                    <td className="px-5 py-4">
                      {s.status === 'at-risk'
                        ? <span className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-lg">At Risk</span>
                        : <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-lg">Active</span>}
                    </td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 hover:text-primary-600 transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
