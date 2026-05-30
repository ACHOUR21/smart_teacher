'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { TrendingUp, TrendingDown, Minus, Download, Loader2 } from 'lucide-react'
import { analyticsApi, assignmentsApi } from '@/lib/api'

interface Assignment {
  id: string
  title: string
  dueDate?: string
  course?: { title: string; subject?: string }
  submissions?: Array<{ grade?: number | null; createdAt?: string }>
}

interface CourseGrade {
  subject: string
  overall: number
  recentWork: { title: string; date: string; score: number; max: number }[]
  trend: 'up' | 'down' | 'stable'
}

const COLORS = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-green-400',
]

function gradeToLetter(g: number) {
  if (g >= 90) return { letter: 'A', color: 'text-emerald-600' }
  if (g >= 80) return { letter: 'B', color: 'text-blue-600' }
  if (g >= 70) return { letter: 'C', color: 'text-amber-600' }
  return { letter: 'D', color: 'text-red-600' }
}

export default function StudentGradesPage() {
  const [avgScore, setAvgScore] = useState<number | null>(null)
  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.student().then((r) => {
        setAvgScore(r.data?.avgScore ?? null)
      }),
      assignmentsApi.getMyAssignments().then((r) => {
        const assignments: Assignment[] = r.data ?? []
        // Group graded submissions by course
        const courseMap: Record<string, { subject: string; scores: number[]; work: { title: string; date: string; score: number; max: number }[] }> = {}
        assignments.forEach((a) => {
          const sub = a.submissions?.[0]
          if (!sub || sub.grade == null) return
          const key = a.course?.subject ?? a.course?.title ?? 'Other'
          if (!courseMap[key]) courseMap[key] = { subject: key, scores: [], work: [] }
          courseMap[key].scores.push(sub.grade)
          courseMap[key].work.push({
            title: a.title,
            date: sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—',
            score: sub.grade,
            max: 100,
          })
        })
        const grades: CourseGrade[] = Object.values(courseMap).map((c) => {
          const avg = Math.round(c.scores.reduce((s, x) => s + x, 0) / c.scores.length)
          const last = c.scores.length >= 2 ? c.scores[c.scores.length - 1] - c.scores[c.scores.length - 2] : 0
          return {
            subject: c.subject,
            overall: avg,
            recentWork: c.work.slice(-3).reverse(),
            trend: last > 2 ? 'up' : last < -2 ? 'down' : 'stable',
          }
        })
        setCourseGrades(grades)
      }),
    ]).finally(() => setLoading(false))
  }, [])

  const displayAvg = avgScore != null
    ? Math.round(avgScore)
    : courseGrades.length > 0
      ? Math.round(courseGrades.reduce((s, g) => s + g.overall, 0) / courseGrades.length)
      : null

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header
        title="My Grades"
        subtitle={displayAvg != null ? `Overall average: ${displayAvg}%` : 'Loading…'}
      />
      <div className="flex-1 p-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {/* Overall summary */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white flex items-center justify-between">
              <div>
                <p className="text-primary-200 text-sm mb-1">Semester Average</p>
                <p className="text-5xl font-bold">{displayAvg != null ? `${displayAvg}%` : '—'}</p>
                {displayAvg != null && (
                  <p className="text-primary-200 text-sm mt-1">Grade {gradeToLetter(displayAvg).letter}</p>
                )}
              </div>
              <div className="text-right">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" /> Export Report
                </button>
              </div>
            </div>

            {courseGrades.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="font-medium text-slate-600 dark:text-slate-300">No graded work yet</p>
                <p className="text-sm mt-1">Complete and submit assignments to see your grades here</p>
              </div>
            ) : (
              courseGrades.map((g, idx) => {
                const { letter, color } = gradeToLetter(g.overall)
                const TrendIcon = g.trend === 'up' ? TrendingUp : g.trend === 'down' ? TrendingDown : Minus
                const trendColor = g.trend === 'up' ? 'text-emerald-500' : g.trend === 'down' ? 'text-red-500' : 'text-slate-400'
                const gradColor = COLORS[idx % COLORS.length]
                return (
                  <div key={g.subject} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card border border-slate-100 dark:border-slate-700">
                    <div className={`h-1.5 bg-gradient-to-r ${gradColor}`} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{g.subject}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                          <span className={`text-4xl font-bold ${color}`}>{g.overall}%</span>
                          <span className={`text-2xl font-bold ${color}`}>{letter}</span>
                        </div>
                      </div>

                      {g.recentWork.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Grades</p>
                          <div className="space-y-2">
                            {g.recentWork.map((r) => (
                              <div key={r.title} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-xs">{r.title}</span>
                                  <span className="text-xs text-slate-400">{r.date}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex-shrink-0">
                                  {r.score}/{r.max}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )
}
