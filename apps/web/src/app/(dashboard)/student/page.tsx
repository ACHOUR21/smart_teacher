import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { BookOpen, Award, TrendingUp, Bot, Play, Clock, CheckCircle2, Star } from 'lucide-react'

const stats = [
  { title: 'Enrolled Courses', value: 8, subtitle: '2 in progress', icon: BookOpen, gradient: 'from-violet-500 to-purple-400', trend: { value: 2, label: 'new this month' } },
  { title: 'Overall Grade', value: '87%', subtitle: 'Above average', icon: Award, gradient: 'from-emerald-500 to-green-400', trend: { value: 5, label: 'vs last semester' } },
  { title: 'Learning Streak', value: '14 days', subtitle: 'Keep it up!', icon: TrendingUp, gradient: 'from-amber-500 to-orange-400', trend: { value: 14, label: 'personal best' } },
  { title: 'AI Tutor Sessions', value: 24, subtitle: 'This month', icon: Bot, gradient: 'from-blue-500 to-cyan-400', trend: { value: 33, label: 'vs last month' } },
]

const courses = [
  { name: 'Advanced Mathematics', progress: 72, grade: '89%', nextLesson: 'Differential Equations', color: 'from-blue-500 to-cyan-400' },
  { name: 'Physics 101', progress: 55, grade: '82%', nextLesson: 'Newton\'s Third Law', color: 'from-violet-500 to-purple-400' },
  { name: 'English Literature', progress: 88, grade: '94%', nextLesson: 'Shakespeare Analysis', color: 'from-rose-500 to-pink-400' },
]

const upcoming = [
  { title: 'Algebra Quiz', subject: 'Mathematics', due: 'Today 11:59 PM', urgent: true },
  { title: 'Lab Report', subject: 'Physics', due: 'Tomorrow', urgent: false },
  { title: 'Essay Draft', subject: 'Literature', due: 'In 3 days', urgent: false },
]

export default function StudentDashboard() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="My Dashboard" subtitle="Keep up the great work, Alex!" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => <StatsCard key={s.title} {...s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900 dark:text-white">My Courses</h2>
              <button className="text-xs text-primary-600 font-medium hover:underline">View all</button>
            </div>
            <div className="space-y-4">
              {courses.map((c) => (
                <div key={c.name} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${c.color}`} />
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500">{c.grade}</span>
                      <button className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg transition-opacity">
                        <Play className="w-3 h-3" fill="currentColor" /> Continue
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <div className={`h-full bg-gradient-to-r ${c.color} rounded-full transition-all`} style={{ width: `${c.progress}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{c.progress}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Next: {c.nextLesson}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tutor */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 translate-x-8" />
            <Bot className="w-8 h-8 mb-4 text-violet-200" />
            <h3 className="font-bold text-lg mb-2">AI Tutor</h3>
            <p className="text-violet-200 text-sm mb-5 leading-relaxed">
              Get instant explanations, practice problems, and study plans tailored to you.
            </p>
            <button className="w-full py-2.5 bg-white text-violet-700 text-sm font-bold rounded-xl hover:bg-violet-50 transition-colors">
              Start a session
            </button>
            <div className="mt-4 pt-4 border-t border-violet-500/30">
              <p className="text-xs text-violet-300 mb-2">Quick ask</p>
              {['Explain integration by parts', 'Quiz me on Newton\'s laws'].map((q) => (
                <button key={q} className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-violet-100 mb-1.5 transition-colors truncate">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Due Soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcoming.map((item) => (
              <div key={item.title} className={`p-4 rounded-xl border ${ item.urgent ? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/40'}`}>
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{item.title}</p>
                <p className="text-xs text-slate-500 mb-2">{item.subject}</p>
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-3 h-3 ${item.urgent ? 'text-red-400' : 'text-slate-400'}`} />
                  <span className={`text-xs font-medium ${item.urgent ? 'text-red-600' : 'text-slate-400'}`}>{item.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
