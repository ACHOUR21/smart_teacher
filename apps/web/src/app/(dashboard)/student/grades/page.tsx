import { Header } from '@/components/layout/header'
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react'

const grades = [
  {
    subject: 'Advanced Mathematics', teacher: 'Dr. Mitchell', color: 'from-blue-500 to-cyan-400',
    overall: 89,
    breakdown: [
      { name: 'Quizzes', weight: 30, score: 91 },
      { name: 'Assignments', weight: 30, score: 87 },
      { name: 'Midterm', weight: 20, score: 84 },
      { name: 'Participation', weight: 20, score: 95 },
    ],
    recent: [
      { title: 'Chapter 5 Quiz', date: 'May 20', score: 95, max: 100 },
      { title: 'Differentiation HW', date: 'May 15', score: 42, max: 50 },
      { title: 'Chapter 4 Quiz', date: 'May 8', score: 88, max: 100 },
    ],
    trend: 'up' as const,
  },
  {
    subject: 'Physics 101', teacher: 'Prof. Cooper', color: 'from-violet-500 to-purple-400',
    overall: 82,
    breakdown: [
      { name: 'Lab Reports', weight: 25, score: 85 },
      { name: 'Assignments', weight: 35, score: 80 },
      { name: 'Midterm', weight: 25, score: 78 },
      { name: 'Participation', weight: 15, score: 90 },
    ],
    recent: [
      { title: 'Forces Lab Report', date: 'May 18', score: 43, max: 50 },
      { title: 'Kinematics Quiz', date: 'May 12', score: 76, max: 100 },
    ],
    trend: 'up' as const,
  },
  {
    subject: 'English Literature', teacher: 'Ms. Davis', color: 'from-rose-500 to-pink-400',
    overall: 94,
    breakdown: [
      { name: 'Essays', weight: 40, score: 95 },
      { name: 'Quizzes', weight: 25, score: 92 },
      { name: 'Participation', weight: 20, score: 97 },
      { name: 'Presentations', weight: 15, score: 90 },
    ],
    recent: [
      { title: 'Macbeth Essay', date: 'May 16', score: 47, max: 50 },
      { title: 'Poetry Quiz', date: 'May 10', score: 94, max: 100 },
    ],
    trend: 'stable' as const,
  },
]

function gradeToLetter(g: number) {
  if (g >= 90) return { letter: 'A', color: 'text-emerald-600' }
  if (g >= 80) return { letter: 'B', color: 'text-blue-600' }
  if (g >= 70) return { letter: 'C', color: 'text-amber-600' }
  return { letter: 'D', color: 'text-red-600' }
}

export default function StudentGradesPage() {
  const avg = Math.round(grades.reduce((s, g) => s + g.overall, 0) / grades.length)

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="My Grades" subtitle={`Overall average: ${avg}%`} />
      <div className="flex-1 p-6 space-y-5">
        {/* Overall summary */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-sm mb-1">Semester Average</p>
            <p className="text-5xl font-bold">{avg}%</p>
            <p className="text-primary-200 text-sm mt-1">Grade B+ · Top 15% of class</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-emerald-300 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+5% vs last month</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Per-subject cards */}
        {grades.map((g) => {
          const { letter, color } = gradeToLetter(g.overall)
          const TrendIcon = g.trend === 'up' ? TrendingUp : g.trend === 'down' ? TrendingDown : Minus
          const trendColor = g.trend === 'up' ? 'text-emerald-500' : g.trend === 'down' ? 'text-red-500' : 'text-slate-400'

          return (
            <div key={g.subject} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card border border-slate-100 dark:border-slate-700">
              <div className={`h-1.5 bg-gradient-to-r ${g.color}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{g.subject}</h3>
                    <p className="text-sm text-slate-500">{g.teacher}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    <span className={`text-4xl font-bold ${color}`}>{g.overall}%</span>
                    <span className={`text-2xl font-bold ${color}`}>{letter}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {g.breakdown.map((b) => (
                    <div key={b.name} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">{b.name} ({b.weight}%)</p>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full mb-1.5">
                        <div className={`h-full bg-gradient-to-r ${g.color} rounded-full`} style={{ width: `${b.score}%` }} />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{b.score}%</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Grades</p>
                  <div className="space-y-2">
                    {g.recent.map((r) => (
                      <div key={r.title} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-700 dark:text-slate-300">{r.title}</span>
                          <span className="text-xs text-slate-400">{r.date}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{r.score}/{r.max}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
