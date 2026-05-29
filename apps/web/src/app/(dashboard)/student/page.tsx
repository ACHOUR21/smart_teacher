'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen, Award, TrendingUp, Bot, Play, Clock,
  Loader2, CheckCircle2
} from 'lucide-react'
import { analyticsApi, coursesApi, assignmentsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { gradeToLetter } from '@/lib/utils'

interface StudentStats {
  enrollments: number
  completedLessons: number
  submissions: number
  gradedSubmissions: number
  avgScore: number | null
  attendances: number
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.student().then((r) => setStats(r.data)),
      coursesApi.getMyEnrollments().then((r) => setCourses(r.data?.slice(0, 3) ?? [])),
      assignmentsApi.getMyAssignments().then((r) => setAssignments(r.data?.slice(0, 3) ?? [])),
    ]).finally(() => setLoading(false))
  }, [])

  const firstName = user?.firstName ?? 'there'

  const statCards = [
    {
      title: 'Enrolled Courses',
      value: loading ? '…' : String(stats?.enrollments ?? 0),
      subtitle: 'Active enrolments',
      icon: BookOpen,
      gradient: 'from-violet-500 to-purple-400',
    },
    {
      title: 'Overall Grade',
      value: loading ? '…' : stats?.avgScore != null ? `${stats.avgScore}%` : 'N/A',
      subtitle: stats?.avgScore != null ? gradeToLetter(stats.avgScore) : 'No grades yet',
      icon: Award,
      gradient: 'from-emerald-500 to-green-400',
    },
    {
      title: 'Lessons Done',
      value: loading ? '…' : String(stats?.completedLessons ?? 0),
      subtitle: 'Completed lessons',
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-400',
    },
    {
      title: 'Assignments',
      value: loading ? '…' : String(stats?.submissions ?? 0),
      subtitle: `${stats?.gradedSubmissions ?? 0} graded`,
      icon: CheckCircle2,
      gradient: 'from-blue-500 to-cyan-400',
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's your learning snapshot for today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3`}>
                {loading
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <s.icon className="w-5 h-5 text-white" />}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{s.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.subtitle}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900 dark:text-white">My Courses</h2>
              <Link href="/student/courses" className="text-xs text-primary-600 font-medium hover:underline">View all</Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No courses yet</p>
                <Link href="/student/courses" className="text-xs text-primary-600 hover:underline mt-1 block">Browse courses</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((enr: any) => {
                  const c = enr.course ?? enr
                  const colors = [
                    'from-blue-500 to-cyan-400',
                    'from-violet-500 to-purple-400',
                    'from-rose-500 to-pink-400',
                  ]
                  const colorIdx = c.title?.charCodeAt(0) % colors.length
                  return (
                    <div key={c.id} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${colors[colorIdx]}`} />
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{c.title}</span>
                        </div>
                        <Link
                          href={`/student/courses/${c.id}`}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg transition-opacity"
                        >
                          <Play className="w-3 h-3" fill="currentColor" /> Continue
                        </Link>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${colors[colorIdx]} rounded-full`} style={{ width: '45%' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* AI Tutor CTA */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 translate-x-8" />
            <Bot className="w-8 h-8 mb-4 text-violet-200" />
            <h3 className="font-bold text-lg mb-2">AI Tutor</h3>
            <p className="text-violet-200 text-sm mb-5 leading-relaxed">
              Get instant explanations, practice problems, and study plans tailored to you.
            </p>
            <Link
              href="/student/ai-tutor"
              className="block w-full py-2.5 bg-white text-violet-700 text-sm font-bold rounded-xl hover:bg-violet-50 transition-colors text-center"
            >
              Start a session
            </Link>
            <div className="mt-4 pt-4 border-t border-violet-500/30">
              <p className="text-xs text-violet-300 mb-2">Quick ask</p>
              {['Explain integration by parts', "Quiz me on Newton's laws"].map((q) => (
                <Link
                  key={q}
                  href={`/student/ai-tutor?q=${encodeURIComponent(q)}`}
                  className="w-full block text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-violet-100 mb-1.5 transition-colors truncate"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Due soon */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Due Soon</h2>
          {loading ? (
            <div className="flex items-center justify-center h-16">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming assignments</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {assignments.map((a: any) => {
                const due = a.dueDate ? new Date(a.dueDate) : null
                const isUrgent = due ? (due.getTime() - Date.now()) < 24 * 60 * 60 * 1000 : false
                return (
                  <Link
                    key={a.id}
                    href={`/student/assignments/${a.id}`}
                    className={`p-4 rounded-xl border block transition-colors hover:bg-opacity-80 ${
                      isUrgent
                        ? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/40'
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1 truncate">{a.title}</p>
                    <p className="text-xs text-slate-500 mb-2">{a.course?.title ?? 'General'}</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-3 h-3 ${isUrgent ? 'text-red-400' : 'text-slate-400'}`} />
                      <span className={`text-xs font-medium ${
                        isUrgent ? 'text-red-600' : 'text-slate-400'
                      }`}>
                        {due ? due.toLocaleDateString() : 'No due date'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
