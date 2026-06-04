'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { TrendingUp, Download, Loader2 } from 'lucide-react'
import { analyticsApi, assignmentsApi } from '@/lib/api'
import { toast } from 'sonner'

interface SubmissionRow {
  id: string
  grade?: number | null
  student?: { firstName: string; lastName: string }
}

interface CourseStats {
  id: string
  title: string
  avgScore?: number | null
  submissionsCount?: number
}

const GRADE_BUCKETS = [
  { grade: 'A (90-100)', color: '#22c55e' },
  { grade: 'B (80-89)', color: '#3b82f6' },
  { grade: 'C (70-79)', color: '#f59e0b' },
  { grade: 'D (60-69)', color: '#f97316' },
  { grade: 'F (<60)', color: '#ef4444' },
]

function gradeColor(g: number) {
  if (g >= 90) return 'text-green-600 dark:text-green-400'
  if (g >= 80) return 'text-blue-600 dark:text-blue-400'
  if (g >= 70) return 'text-amber-600 dark:text-amber-400'
  if (g >= 60) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

function gradeToLetter(g: number) {
  if (g >= 90) return 'A'
  if (g >= 80) return 'B'
  if (g >= 70) return 'C'
  if (g >= 60) return 'D'
  return 'F'
}

export default function TeacherGradesPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<CourseStats[]>([])
  const [gradeBuckets, setGradeBuckets] = useState<{ grade: string; count: number; color: string }[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)

  useEffect(() => {
    analyticsApi.teacher()
      .then((r) => {
        const data = r.data
        const courseList: CourseStats[] = data.courses ?? []
        setCourses(courseList)
        if (courseList.length > 0) setSelectedCourseId(courseList[0].id)

        const buckets: { grade: string; count: number; color: string }[] = GRADE_BUCKETS.map((b) => ({
          ...b,
          count: data.gradeBuckets?.[b.grade.split(' ')[0]] ?? 0,
        }))
        setGradeBuckets(buckets)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedCourseId) return
    setLoadingSubs(true)
    // Fetch submissions for assignments in the selected course
    assignmentsApi.getAll({ courseId: selectedCourseId })
      .then(async (r) => {
        const assignments = r.data ?? []
        if (assignments.length === 0) { setSubmissions([]); return }
        const subsResults = await Promise.allSettled(
          assignments.slice(0, 3).map((a: any) =>
            assignmentsApi.getSubmissions(a.id).then((sr) => sr.data ?? [])
          )
        )
        const allSubs: SubmissionRow[] = []
        subsResults.forEach((res) => {
          if (res.status === 'fulfilled') allSubs.push(...res.value)
        })
        setSubmissions(allSubs)
      })
      .catch(() => setSubmissions([]))
      .finally(() => setLoadingSubs(false))
  }, [selectedCourseId])

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)
  const gradedSubs = submissions.filter((s) => s.grade != null)
  const avg = gradedSubs.length
    ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.grade ?? 0), 0) / gradedSubs.length)
    : (selectedCourse?.avgScore != null ? Math.round(selectedCourse.avgScore) : null)
  const highest = gradedSubs.length ? Math.max(...gradedSubs.map((s) => s.grade!)) : null
  const lowest = gradedSubs.length ? Math.min(...gradedSubs.map((s) => s.grade!)) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grade Book</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and analyse student grades</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* Course selector */}
          {courses.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCourseId === c.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Class Average', value: avg != null ? `${avg}%` : '—', color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Highest Grade', value: highest != null ? `${highest}%` : '—', color: 'text-green-600 dark:text-green-400' },
              { label: 'Lowest Grade', value: lowest != null ? `${lowest}%` : '—', color: 'text-red-600 dark:text-red-400' },
              { label: 'Submissions', value: (submissions.length || selectedCourse?.submissionsCount) ?? '—', color: 'text-primary-600' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Grade Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={gradeBuckets} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="grade" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {gradeBuckets.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Grade breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Grade Breakdown</h2>
              <div className="space-y-3">
                {gradeBuckets.map((d) => (
                  <div key={d.grade} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{d.grade}</span>
                    <span className="text-sm font-semibold" style={{ color: d.color }}>{d.count} students</span>
                    <div className="w-24 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${gradeBuckets.reduce((s, b) => s + b.count, 0) > 0
                            ? (d.count / gradeBuckets.reduce((s, b) => s + b.count, 0)) * 100
                            : 0}%`,
                          backgroundColor: d.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submission grades table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Student Submissions</h2>
              {loadingSubs && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
            </div>
            <div className="overflow-x-auto">
              {submissions.length === 0 && !loadingSubs ? (
                <div className="text-center py-10 text-slate-400 text-sm">No graded submissions yet for this course</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      {['Student', 'Grade', 'Letter'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {gradedSubs.map((s, i) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                              {s.student ? `${s.student.firstName[0]}${s.student.lastName[0]}` : `S${i + 1}`}
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {s.student ? `${s.student.firstName} ${s.student.lastName}` : `Student ${i + 1}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${gradeColor(s.grade!)}`}>{s.grade}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${gradeColor(s.grade!)}`}>{gradeToLetter(s.grade!)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
