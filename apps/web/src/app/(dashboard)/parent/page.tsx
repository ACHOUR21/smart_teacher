'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Users, BarChart3, Calendar, Bell, TrendingUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { notificationsApi } from '@/lib/api'

// Parent-child relationship data comes from future /parent/children endpoint
// For now we show a representative mock layout alongside real notifications
const CHILDREN = [
  {
    name: 'Lina Hassan',
    grade: 'Grade 9',
    avatar: 'LH',
    overallGrade: '88%',
    attendance: '96%',
    color: 'from-violet-500 to-purple-400',
    subjects: [
      { name: 'Mathematics', grade: '92%', trend: 'up' },
      { name: 'Physics', grade: '84%', trend: 'up' },
      { name: 'English', grade: '91%', trend: 'stable' },
    ],
  },
  {
    name: 'Omar Hassan',
    grade: 'Grade 6',
    avatar: 'OH',
    overallGrade: '79%',
    attendance: '92%',
    color: 'from-blue-500 to-cyan-400',
    subjects: [
      { name: 'Science', grade: '82%', trend: 'up' },
      { name: 'Math', grade: '74%', trend: 'down' },
      { name: 'History', grade: '85%', trend: 'up' },
    ],
  },
]

interface Notification {
  id: string
  message: string
  type?: string
  isRead: boolean
  createdAt: string
}

export default function ParentDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(true)

  useEffect(() => {
    notificationsApi.getAll({ limit: 5 })
      .then((r) => setNotifications(r.data?.data ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingNotifs(false))
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getIcon = (type?: string) => {
    if (type === 'success' || type === 'GRADE') return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
    if (type === 'warning' || type === 'ATTENDANCE') return <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
    return <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Parent Overview" subtitle={`Monitoring ${CHILDREN.length} children`} />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatsCard title="Children" value={CHILDREN.length} subtitle="2 schools" icon={Users} gradient="from-blue-500 to-cyan-400" />
          <StatsCard title="Avg. Grade" value="84%" subtitle="Both children" icon={BarChart3} gradient="from-emerald-500 to-green-400" trend={{ value: 4, label: 'vs last term' }} />
          <StatsCard title="Avg. Attendance" value="94%" subtitle="This semester" icon={Calendar} gradient="from-violet-500 to-purple-400" trend={{ value: 2, label: 'vs last semester' }} />
          <StatsCard
            title="Alerts"
            value={loadingNotifs ? '…' : unreadCount}
            subtitle="Unread notifications"
            icon={Bell}
            gradient="from-rose-500 to-pink-400"
          />
        </div>

        {/* Children cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CHILDREN.map((child) => (
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

              <div className="space-y-3">
                {child.subjects.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.grade}</span>
                      <TrendingUp className={`w-3.5 h-3.5 ${
                        s.trend === 'up' ? 'text-emerald-500'
                        : s.trend === 'down' ? 'text-red-400 rotate-180'
                        : 'text-slate-300'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Notifications — real data */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Notifications</h2>
          {loadingNotifs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-6">No notifications yet</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${
                  n.isRead ? 'bg-slate-50 dark:bg-slate-700/50' : 'bg-primary-50 dark:bg-primary-900/10'
                }`}>
                  {getIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
