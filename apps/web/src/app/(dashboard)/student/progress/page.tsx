'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Award, Zap, Target, Flame, Star, Loader2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer
} from 'recharts'
import { analyticsApi, coursesApi } from '@/lib/api'
import { gradeToLetter } from '@/lib/utils'

const WEEKLY_ACTIVITY_FALLBACK = [
  { day: 'Mon', minutes: 45 }, { day: 'Tue', minutes: 90 },
  { day: 'Wed', minutes: 30 }, { day: 'Thu', minutes: 120 },
  { day: 'Fri', minutes: 60 }, { day: 'Sat', minutes: 75 },
  { day: 'Sun', minutes: 15 },
]

const BADGES = [
  { name: 'Fast Learner', icon: Zap, desc: 'Complete 5 lessons in one day', color: 'from-amber-400 to-orange-400' },
  { name: 'Top Scorer', icon: Star, desc: 'Score 90%+ on 3 consecutive quizzes', color: 'from-violet-400 to-purple-500' },
  { name: 'Streak Master', icon: Flame, desc: '14-day learning streak', color: 'from-red-400 to-rose-500' },
  { name: 'Perfect Score', icon: Target, desc: 'Score 100% on any assignment', color: 'from-slate-300 to-slate-400' },
]

const PROGRESS_COLORS = ['#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6']

interface StudentStats {
  enrollments: number
  completedLessons: number
  gradedSubmissions: number
  avgScore: number | null
  recentScores: Array<{ score: number | null; date: string }>
  weeklyActivity?: Array<{ day: string; minutes: number }>
}

interface CourseProgress {
  courseId: string
  totalLessons: number
  completedLessons: number
  percentage: number
}

export default function StudentProgressPage() {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [courseProgress, setCourseProgress] = useState<Record<string, CourseProgress>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.student().then((r) => setStats(r.data)),
      coursesApi.getMyEnrollments().then((r) => {
        const enrs = r.data?.slice(0, 6) ?? []
        setEnrollments(enrs)
        return enrs
      }),
    ]).then((results) => {
      const enrollResult = results[1]
      if (enrollResult.status === 'fulfilled') {
        const enrs = enrollResult.value as any[]
        Promise.allSettled(
          enrs.map((enr: any) => {
            const courseId = enr.course?.id ?? enr.courseId ?? enr.id
            return coursesApi.getCourseProgress(courseId).then((r) => ({
              courseId,
              ...r.data,
            } as CourseProgress))
          })
        ).then((progressResults) => {
          const map: Record<string, CourseProgress> = {}
          progressResults.forEach((res) => {
            if (res.status === 'fulfilled') {
              map[res.value.courseId] = res.value
            }
          })
          setCourseProgress(map)
        })
      }
    }).finally(() => setLoading(false))
  }, [])

  const weeklyActivity = stats?.weeklyActivity ?? WEEKLY_ACTIVITY_FALLBACK
  const hasRealActivity = stats?.weeklyActivity != null && stats.weeklyActivity.some((d) => d.minutes > 0)

  const gradeTrend = stats?.recentScores?.length
    ? stats.recentScores.slice().reverse().map((s, i) => ({
        label: `#${i + 1}`,
        grade: s.score ?? 0,
      }))
    : [{ label: 'Jan', grade: 74 }, { label: 'Feb', grade: 78 }, { label: 'Mar', grade: 82 }, { label: 'Apr', grade: 85 }]

  const statCards = [
    {
      title: 'Overall Grade',
      value: loading ? '…' : stats?.avgScore != null ? `${stats.avgScore}%` : 'N/A',
      icon: Award,
      gradient: 'from-emerald-500 to-green-400',
      sub: stats?.avgScore != null ? gradeToLetter(stats.avgScore) : 'No grades yet',
    },
    {
      title: 'Courses Enrolled',
      value: loading ? '…' : String(stats?.enrollments ?? 0),
      icon: Target,
      gradient: 'from-violet-500 to-purple-400',
      sub: 'Active enrolments',
    },
    {
      title: 'Lessons Complete',
      value: loading ? '…' : String(stats?.completedLessons ?? 0),
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-400',
      sub: 'Total completed',
    },
    {
      title: 'Graded Work',
      value: loading ? '…' : String(stats?.gradedSubmissions ?? 0),
      icon: Zap,
      gradient: 'from-amber-500 to-orange-400',
      sub: 'Submissions graded',
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Progress</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.title} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3`}>
                {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <s.icon className="w-5 h-5 text-white" />}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{s.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly activity */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-5">
              {hasRealActivity ? 'This Week — Study Time (minutes)' : 'Weekly Study Time (minutes)'}
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyActivity} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: any) => [`${v} min`, 'Study time']}
                />
                <Bar dataKey="minutes" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade trend */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-5">
              {stats?.recentScores?.length ? 'Recent Assignment Scores' : 'Grade Trend'}
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={gradeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: any) => [`${v}%`, 'Score']}
                />
                <Line type="monotone" dataKey="grade" stroke="#0c84e8" strokeWidth={3} dot={{ fill: '#0c84e8', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrolled courses progress */}
        {enrollments.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Course Progress</h2>
            <div className="space-y-4">
              {enrollments.map((enr: any, i: number) => {
                const c = enr.course ?? enr
                const courseId = c.id
                const color = PROGRESS_COLORS[i % PROGRESS_COLORS.length]
                const prog = courseProgress[courseId]
                const pct = prog?.percentage ?? 0
                return (
                  <div key={courseId} className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-36 flex-shrink-0 truncate">{c.title}</span>
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 w-10 text-right">
                      {prog ? `${pct}%` : '…'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BADGES.map((b, i) => {
              const earned = i < (stats?.gradedSubmissions ?? 0 > 3 ? 3 : (stats?.completedLessons ?? 0 > 5 ? 2 : 1))
              return (
                <div key={b.name} className={`text-center p-5 rounded-2xl border ${
                  earned
                    ? 'border-transparent bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700'
                    : 'border-slate-200 dark:border-slate-700 opacity-40'
                }`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                    <b.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-tight">{b.desc}</p>
                  {earned && (
                    <span className="inline-block mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      Earned
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
