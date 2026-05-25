import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Users, BarChart3, Calendar, Bell, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'

const children = [
  {
    name: 'Lina Johnson',
    grade: 'Grade 9',
    avatar: 'LJ',
    overallGrade: '88%',
    attendance: '96%',
    color: 'from-violet-500 to-purple-400',
    subjects: [
      { name: 'Mathematics', grade: '92%', trend: 'up' },
      { name: 'Physics', grade: '84%', trend: 'up' },
      { name: 'English', grade: '91%', trend: 'stable' },
    ],
    recentActivity: 'Submitted Algebra Quiz',
    activityTime: '2 hours ago',
  },
  {
    name: 'Omar Johnson',
    grade: 'Grade 6',
    avatar: 'OJ',
    overallGrade: '79%',
    attendance: '92%',
    color: 'from-blue-500 to-cyan-400',
    subjects: [
      { name: 'Science', grade: '82%', trend: 'up' },
      { name: 'Math', grade: '74%', trend: 'down' },
      { name: 'History', grade: '85%', trend: 'up' },
    ],
    recentActivity: 'Joined Live Science Class',
    activityTime: 'Yesterday',
  },
]

const notifications = [
  { message: 'Lina scored 95% on Physics test', time: '1h ago', type: 'success' },
  { message: 'Omar missed today\'s Math class', time: '3h ago', type: 'warning' },
  { message: 'School meeting scheduled for June 3', time: '1d ago', type: 'info' },
]

export default function ParentDashboard() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Parent Overview" subtitle="Monitoring 2 children" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatsCard title="Children" value={2} subtitle="2 schools" icon={Users} gradient="from-blue-500 to-cyan-400" />
          <StatsCard title="Avg. Grade" value="84%" subtitle="Both children" icon={BarChart3} gradient="from-emerald-500 to-green-400" trend={{ value: 4, label: 'vs last term' }} />
          <StatsCard title="Avg. Attendance" value="94%" subtitle="This semester" icon={Calendar} gradient="from-violet-500 to-purple-400" trend={{ value: 2, label: 'vs last semester' }} />
          <StatsCard title="Unread Alerts" value={3} subtitle="Requires attention" icon={Bell} gradient="from-rose-500 to-pink-400" />
        </div>

        {/* Children cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {children.map((child) => (
            <div key={child.name} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${child.color} flex items-center justify-center text-white font-bold`}>
                  {child.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{child.name}</h3>
                  <p className="text-sm text-slate-500">{child.grade}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold gradient-text">{child.overallGrade}</p>
                  <p className="text-xs text-slate-400">Overall grade</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {child.subjects.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.grade}</span>
                      <TrendingUp className={`w-3.5 h-3.5 ${ s.trend === 'up' ? 'text-emerald-500' : s.trend === 'down' ? 'text-red-400 rotate-180' : 'text-slate-300'}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{child.recentActivity}</p>
                  <p className="text-xs text-slate-400">{child.activityTime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Notifications</h2>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.message} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
                {n.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                {n.type === 'info' && <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
