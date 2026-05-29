'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen, Users, BarChart3, Sparkles, Clock,
  AlertCircle, Video, Loader2
} from 'lucide-react'
import { analyticsApi, liveApi, assignmentsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface TeacherStats {
  totalCourses: number
  totalStudents: number
  avgScore: number
  liveSessions: number
  totalSubmissions: number
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.allSettled([
      analyticsApi.teacher().then((r) => setStats(r.data)),
      liveApi.getSessions({ upcoming: true, limit: 3 }).then((r) => setSessions(r.data?.data ?? [])),
      assignmentsApi.getAll({ limit: 3 }).then((r) => setAssignments(r.data?.data ?? [])),
    ]).finally(() => setLoading(false))
  }, [])

  const firstName = user?.firstName ?? 'Teacher'

  const statCards = [
    {
      title: 'Active Courses',
      value: loading ? '…' : String(stats?.totalCourses ?? 0),
      subtitle: 'Courses you teach',
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      title: 'Total Students',
      value: loading ? '…' : String(stats?.totalStudents ?? 0),
      subtitle: 'Across all courses',
      icon: Users,
      gradient: 'from-violet-500 to-purple-400',
    },
    {
      title: 'Avg. Grade',
      value: loading ? '…' : stats?.avgScore != null ? `${stats.avgScore}%` : 'N/A',
      subtitle: 'Graded submissions',
      icon: BarChart3,
      gradient: 'from-emerald-500 to-green-400',
    },
    {
      title: 'Live Sessions',
      value: loading ? '…' : String(stats?.liveSessions ?? 0),
      subtitle: 'Total hosted',
      icon: Video,
      gradient: 'from-amber-500 to-orange-400',
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here’s what’s happening in your classes today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.title} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3`}>
                {loading
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <s.icon className="w-5 h-5 text-white" />}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{s.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming / recent live sessions */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900 dark:text-white">Today’s Classes</h2>
              <Link href="/teacher/live" className="text-xs text-primary-600 font-medium hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No sessions scheduled</p>
                <Link href="/teacher/live" className="text-xs text-primary-600 hover:underline mt-1 block">Schedule a class</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      s.status === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.title}</p>
                      <p className="text-xs text-slate-400">
                        {s.scheduledAt ? new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'}
                      </p>
                    </div>
                    {s.status === 'LIVE' ? (
                      <Link href={`/teacher/live/${s.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg">
                        <Video className="w-3 h-3" /> Join
                      </Link>
                    ) : (
                      <Link href={`/teacher/live/${s.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg dark:bg-primary-950/40 dark:text-primary-400">
                        <Clock className="w-3 h-3" /> View
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Studio quick launch */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <Sparkles className="w-8 h-8 mb-4 text-primary-200" />
            <h3 className="font-bold text-lg mb-2">AI Studio</h3>
            <p className="text-primary-200 text-sm mb-6 leading-relaxed">
              Generate lessons, quizzes, summaries, and mind maps in seconds.
            </p>
            <div className="space-y-2">
              {[
                { label: 'Generate Quiz', href: '/teacher/ai-studio?tool=quiz' },
                { label: 'Create Lesson Plan', href: '/teacher/ai-studio?tool=lesson' },
                { label: 'Grade Assignments', href: '/teacher/assignments' },
              ].map((action) => (
                <Link key={action.label} href={action.href}
                  className="w-full block text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Pending assignments */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Assignments</h2>
            <Link href="/teacher/assignments" className="text-xs text-primary-600 font-medium hover:underline">All assignments</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-16">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No assignments yet</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((a: any) => {
                const due = a.dueDate ? new Date(a.dueDate) : null
                const isUrgent = due ? (due.getTime() - Date.now()) < 24 * 60 * 60 * 1000 : false
                return (
                  <div key={a.id} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{a.title}</p>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full flex-shrink-0">
                          {a.course?.title ?? 'General'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
                      {isUrgent ? <AlertCircle className="w-3.5 h-3.5 text-red-400" /> : <Clock className="w-3.5 h-3.5" />}
                      {due ? due.toLocaleDateString() : 'No due date'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
