import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { BookOpen, Users, BarChart3, Sparkles, Clock, CheckCircle2, AlertCircle, Video } from 'lucide-react'

const stats = [
  { title: 'Active Courses', value: 12, subtitle: '3 drafts', icon: BookOpen, gradient: 'from-blue-500 to-cyan-400', trend: { value: 8, label: 'vs last month' } },
  { title: 'Total Students', value: '248', subtitle: 'Across all courses', icon: Users, gradient: 'from-violet-500 to-purple-400', trend: { value: 12, label: 'vs last month' } },
  { title: 'Avg. Grade', value: '82%', subtitle: 'Class average', icon: BarChart3, gradient: 'from-emerald-500 to-green-400', trend: { value: 3, label: 'vs last period' } },
  { title: 'AI Sessions Used', value: 94, subtitle: 'This month', icon: Sparkles, gradient: 'from-amber-500 to-orange-400', trend: { value: 28, label: 'vs last month' } },
]

const upcomingClasses = [
  { subject: 'Advanced Mathematics', time: '10:00 AM', students: 32, status: 'live' },
  { subject: 'Physics 101', time: '1:00 PM', students: 28, status: 'scheduled' },
  { subject: 'Chemistry Lab', time: '3:30 PM', students: 20, status: 'scheduled' },
]

const pendingAssignments = [
  { title: 'Algebra Quiz — Ch. 5', subject: 'Mathematics', submissions: 28, total: 32, due: 'Today' },
  { title: 'Newton\'s Laws Essay', subject: 'Physics', submissions: 15, total: 28, due: 'Tomorrow' },
  { title: 'Lab Report — Titration', subject: 'Chemistry', submissions: 8, total: 20, due: 'In 3 days' },
]

export default function TeacherDashboard() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Teacher Dashboard" subtitle="Monday, 25 May 2026" />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => <StatsCard key={s.title} {...s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming classes */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900 dark:text-white">Today&apos;s Classes</h2>
              <button className="text-xs text-primary-600 font-medium hover:underline">View schedule</button>
            </div>
            <div className="space-y-3">
              {upcomingClasses.map((cls) => (
                <div key={cls.subject} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ cls.status === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{cls.subject}</p>
                    <p className="text-xs text-slate-400">{cls.time} &middot; {cls.students} students</p>
                  </div>
                  {cls.status === 'live' ? (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg">
                      <Video className="w-3 h-3" /> Join
                    </button>
                  ) : (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg dark:bg-primary-950/40 dark:text-primary-400">
                      <Clock className="w-3 h-3" /> {cls.time}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Studio quick launch */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <Sparkles className="w-8 h-8 mb-4 text-primary-200" />
            <h3 className="font-bold text-lg mb-2">AI Studio</h3>
            <p className="text-primary-200 text-sm mb-6 leading-relaxed">Generate lessons, quizzes, summaries, and mind maps in seconds.</p>
            <div className="space-y-2">
              {['Generate Quiz', 'Create Lesson Plan', 'Grade Assignments'].map((action) => (
                <button key={action} className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pending assignments */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">Pending Assignments</h2>
            <button className="text-xs text-primary-600 font-medium hover:underline">All assignments</button>
          </div>
          <div className="space-y-3">
            {pendingAssignments.map((a) => (
              <div key={a.title} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{a.title}</p>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full flex-shrink-0">{a.subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${(a.submissions / a.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{a.submissions}/{a.total} submitted</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
                  {a.due === 'Today' ? <AlertCircle className="w-3.5 h-3.5 text-red-400" /> : <Clock className="w-3.5 h-3.5" />}
                  {a.due}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
