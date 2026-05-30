'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Award, BookOpen, ClipboardList, Calendar,
  Mail, MessageCircle, AlertTriangle, CheckCircle2, Clock,
  BarChart2, Loader2
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Link from 'next/link'
import { usersApi, assignmentsApi } from '@/lib/api'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  createdAt: string
  _count?: { enrollments?: number }
}

interface Submission {
  id: string
  grade?: number | null
  createdAt: string
  assignment?: { title: string; dueDate?: string }
}

const FALLBACK_TREND = [
  { week: 'W1', grade: 72 }, { week: 'W2', grade: 75 },
  { week: 'W3', grade: 80 }, { week: 'W4', grade: 85 },
  { week: 'W5', grade: 82 }, { week: 'W6', grade: 88 },
]

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function TeacherStudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      usersApi.getOne(studentId).then((r) => setStudent(r.data)),
      // Try to get submissions for this student from teacher's assignments
      assignmentsApi.getAll().then(async (r) => {
        const assignments = r.data ?? []
        const subResults = await Promise.allSettled(
          assignments.slice(0, 5).map((a: any) =>
            assignmentsApi.getSubmissions(a.id)
              .then((sr) => (sr.data ?? []).filter((s: any) => s.studentId === studentId).map((s: any) => ({
                ...s,
                assignment: { title: a.title, dueDate: a.dueDate },
              })))
          )
        )
        const allSubs: Submission[] = []
        subResults.forEach((res) => {
          if (res.status === 'fulfilled') allSubs.push(...res.value)
        })
        setSubmissions(allSubs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6))
      }),
    ]).finally(() => setLoading(false))
  }, [studentId])

  const gradedSubs = submissions.filter((s) => s.grade != null)
  const avgGrade = gradedSubs.length
    ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.grade ?? 0), 0) / gradedSubs.length)
    : null

  // Build grade trend from submissions
  const gradeTrend = gradedSubs.length >= 2
    ? gradedSubs.slice(-6).map((s, i) => ({ week: `W${i + 1}`, grade: s.grade! }))
    : FALLBACK_TREND

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Student not found</p>
        <button onClick={() => router.back()} className="mt-3 text-primary-600 text-sm hover:underline">Go back</button>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{student.email}</p>
          </div>
          {!student.isActive && (
            <span className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
              <AlertTriangle className="w-4 h-4" /> Inactive
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <a
            href={`mailto:${student.email}`}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
          >
            <Mail className="w-4 h-4" /> Email
          </a>
          <Link
            href="/teacher/messages"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Message
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart2}
          label="Current Grade"
          value={avgGrade != null ? `${avgGrade}%` : '—'}
          sub={gradedSubs.length > 0 ? `${gradedSubs.length} graded` : 'No graded work yet'}
          color="bg-primary-100 dark:bg-primary-900/30 text-primary-600"
        />
        <StatCard
          icon={Calendar}
          label="Enrolled Since"
          value={new Date(student.createdAt).getFullYear()}
          sub={new Date(student.createdAt).toLocaleDateString()}
          color="bg-green-100 dark:bg-green-900/30 text-green-600"
        />
        <StatCard
          icon={ClipboardList}
          label="Courses"
          value={student._count?.enrollments ?? '—'}
          sub="Enrollments"
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-600"
        />
        <StatCard
          icon={Award}
          label="Submissions"
          value={submissions.length}
          sub={`${gradedSubs.length} graded`}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600"
        />
      </div>

      {/* Grade trend chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          {gradedSubs.length >= 2 ? 'Grade Trend (Recent Submissions)' : 'Grade Trend (Demo)'}
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={gradeTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="grade" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent submissions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Submissions</h3>
        {submissions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No submissions found for this student</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  sub.grade != null
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-500'
                }`}>
                  {sub.grade != null ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{sub.assignment?.title ?? 'Assignment'}</p>
                  <p className="text-xs text-slate-400">{new Date(sub.createdAt).toLocaleDateString()}</p>
                </div>
                {sub.grade != null && (
                  <span className={`text-sm font-bold ${
                    sub.grade >= 90 ? 'text-green-600' : sub.grade >= 75 ? 'text-blue-600' : 'text-orange-600'
                  }`}>{sub.grade}%</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
