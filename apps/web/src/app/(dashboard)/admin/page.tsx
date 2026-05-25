import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Users, BookOpen, BarChart3, CreditCard, TrendingUp, Shield, AlertCircle } from 'lucide-react'

const stats = [
  { title: 'Total Users', value: '12,483', subtitle: '+48 today', icon: Users, gradient: 'from-blue-500 to-cyan-400', trend: { value: 8, label: 'vs last month' } },
  { title: 'Active Courses', value: '2,418', subtitle: '124 new this month', icon: BookOpen, gradient: 'from-violet-500 to-purple-400', trend: { value: 15, label: 'vs last month' } },
  { title: 'Monthly Revenue', value: '$48.2K', subtitle: 'MRR', icon: CreditCard, gradient: 'from-emerald-500 to-green-400', trend: { value: 22, label: 'vs last month' } },
  { title: 'Platform Health', value: '99.9%', subtitle: 'Uptime this month', icon: Shield, gradient: 'from-amber-500 to-orange-400', trend: { value: 0, label: 'stable' } },
]

const recentUsers = [
  { name: 'Sarah Mitchell', email: 'sarah@school.edu', role: 'Teacher', joined: '2h ago', status: 'active' },
  { name: 'Youssef Amrani', email: 'y.amrani@edu.ma', role: 'Student', joined: '4h ago', status: 'active' },
  { name: 'Marie Dupont', email: 'marie@ecole.fr', role: 'Parent', joined: '6h ago', status: 'pending' },
  { name: 'Ahmed Khalil', email: 'ahmed@academy.ae', role: 'Admin', joined: '1d ago', status: 'active' },
]

const roleColors: Record<string, string> = {
  Teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  Student: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  Parent: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  Admin: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
}

const systemAlerts = [
  { level: 'info', message: 'Scheduled maintenance: June 1, 2:00–4:00 AM UTC' },
  { level: 'warning', message: '3 failed login attempts for user omar@school.edu' },
  { level: 'info', message: 'AI quota at 78% for this billing cycle' },
]

export default function AdminDashboard() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Admin Dashboard" subtitle="Platform overview" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => <StatsCard key={s.title} {...s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent users */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900 dark:text-white">Recent Users</h2>
              <button className="text-xs text-primary-600 font-medium hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.email} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold flex-shrink-0">
                    {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 ${roleColors[user.role]}`}>{user.role}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{user.joined}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System alerts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">System Alerts</h2>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.message} className={`p-3 rounded-xl flex items-start gap-2.5 ${ alert.level === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30' : 'bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30'}`}>
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${ alert.level === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-xs font-medium text-primary-600 border border-primary-200 dark:border-primary-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors">
              View all alerts
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Add User', icon: Users, color: 'from-blue-500 to-cyan-400' },
              { label: 'Create Course', icon: BookOpen, color: 'from-violet-500 to-purple-400' },
              { label: 'View Reports', icon: BarChart3, color: 'from-emerald-500 to-green-400' },
              { label: 'Security Log', icon: Shield, color: 'from-amber-500 to-orange-400' },
            ].map((action) => (
              <button key={action.label} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
