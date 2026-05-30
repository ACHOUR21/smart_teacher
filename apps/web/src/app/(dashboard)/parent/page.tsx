'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Users, BarChart3, Calendar, Bell, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { notificationsApi, usersApi } from '@/lib/api'

interface ChildCard {
  name: string
  grade: string
  avatar: string
  overallGrade: string | null
  enrolledCourses: number
  sessionsAttended: number
  color: string
  subjects: { name: string; grade: string; trend: 'up' | 'down' | 'stable' }[]
}

interface Notification {
  id: string
  message?: string
  body?: string
  title?: string
  type?: string
  isRead: boolean
  createdAt: string
}

const CARD_COLORS = [
  'from-violet-500 to-purple-400',
  'from-blue-500 to-cyan-400',
  'from-emerald-500 to-green-400',
  'from-amber-500 to-orange-400',
]

function buildChildCard(student: any, idx: number): ChildCard {
  const submissions = student.submissions ?? []
  const courseMap: Record<string, number[]> = {}
  for (const sub of submissions) {
    if (sub.score == null) continue
    const title = sub.assignment?.course?.title ?? sub.assignment?.course?.category ?? 'Course'
    if (!courseMap[title]) courseMap[title] = []
    courseMap[title].push(sub.score)
  }
  const allScores = submissions
    .filter((s: any) => s.score != null)
    .map((s: any) => s.score as number)
  const avgGrade =
    allScores.length > 0
      ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length)
      : null

  const subjects = Object.entries(courseMap)
    .slice(0, 3)
    .map(([name, scores]) => {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      const lastTwo = scores.slice(-2)
      const trend: 'up' | 'down' | 'stable' =
        lastTwo.length >= 2
          ? lastTwo[1] > lastTwo[0]
            ? 'up'
            : lastTwo[1] < lastTwo[0]
            ? 'down'
            : 'stable'
          : 'stable'
      return { name, grade: `${avg}%`, trend }
    })

  return {
    name: `${student.user?.firstName ?? ''} ${student.user?.lastName ?? ''}`.trim() || 'Student',
    grade: student.grade ?? '—',
    avatar: `${student.user?.firstName?.[0] ?? ''}${student.user?.lastName?.[0] ?? ''}`.toUpperCase() || '?',
    overallGrade: avgGrade !== null ? `${avgGrade}%` : null,
    enrolledCourses: student._count?.enrollments ?? student.enrollments?.length ?? 0,
    sessionsAttended: student.attendances?.length ?? 0,
    color: CARD_COLORS[idx % CARD_COLORS.length],
    subjects,
  }
}

function TrendIcon({ t }: { t: 'up' | 'down' | 'stable' }) {
  if (t === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
  if (t === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />
  return <Minus className="w-3.5 h-3.5 text-slate-300" />
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<ChildCard[]>([])
  const [loadingChildren, setLoadingChildren] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(true)

  useEffect(() => {
    usersApi
      .getMyChildren()
      .then((r) => {
        const list: any[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
        setChildren(list.map(buildChildCard))
      })
      .catch(() => {})
      .finally(() => setLoadingChildren(false))

    notificationsApi
      .getAll({ limit: 5 })
      .then((r) => setNotifications(r.data?.data ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingNotifs(false))
  }, [])

  const avgGradeStr = (() => {
    const scores = children.flatMap((c) => {
      const n = c.overallGrade ? parseInt(c.overallGrade) : NaN
      return isNaN(n) ? [] : [n]
    })
    return scores.length > 0
      ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%`
      : '—'
  })()

  const totalAttended = children.reduce((s, c) => s + c.sessionsAttended, 0)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getIcon = (type?: string) => {
    if (type === 'success' || type === 'GRADE')
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
    if (type === 'warning' || type === 'ATTENDANCE')
      return <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
    return <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header
        title="Parent Overview"
        subtitle={
          loadingChildren
            ? 'Loading…'
            : `Monitoring ${children.length} ${children.length === 1 ? 'child' : 'children'}`
        }
      />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Children"
            value={loadingChildren ? '…' : children.length}
            subtitle="linked to account"
            icon={Users}
            gradient="from-blue-500 to-cyan-400"
          />
          <StatsCard
            title="Avg. Grade"
            value={loadingChildren ? '…' : avgGradeStr}
            subtitle="across all children"
            icon={BarChart3}
            gradient="from-emerald-500 to-green-400"
          />
          <StatsCard
            title="Sessions Attended"
            value={loadingChildren ? '…' : totalAttended}
            subtitle="total live attendance"
            icon={Calendar}
            gradient="from-violet-500 to-purple-400"
          />
          <StatsCard
            title="Alerts"
            value={loadingNotifs ? '…' : unreadCount}
            subtitle="unread notifications"
            icon={Bell}
            gradient="from-rose-500 to-pink-400"
          />
        </div>

        {/* Children cards */}
        {loadingChildren ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-100 dark:border-slate-700 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No children linked</p>
            <p className="text-sm text-slate-400 mt-1">
              Contact your school administrator to link your children&apos;s accounts
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {children.map((child) => (
              <div
                key={child.name}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${child.color} flex items-center justify-center text-white font-bold`}
                  >
                    {child.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{child.name}</h3>
                    <p className="text-sm text-slate-500">
                      {child.grade} &middot; {child.enrolledCourses} course
                      {child.enrolledCourses !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold gradient-text">
                      {child.overallGrade ?? '—'}
                    </p>
                    <p className="text-xs text-slate-400">Overall grade</p>
                  </div>
                </div>

                {child.subjects.length > 0 ? (
                  <div className="space-y-3">
                    {child.subjects.map((s) => (
                      <div key={s.name} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400 truncate flex-1 mr-2">
                          {s.name}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {s.grade}
                          </span>
                          <TrendIcon t={s.trend} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-2">No graded work yet</p>
                )}
              </div>
            ))}
          </div>
        )}

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
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 rounded-xl ${
                    n.isRead
                      ? 'bg-slate-50 dark:bg-slate-700/50'
                      : 'bg-primary-50 dark:bg-primary-900/10'
                  }`}
                >
                  {getIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {n.body ?? n.message ?? n.title ?? ''}
                    </p>
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
