'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import {
  Plus, Search, BookOpen, Users, Clock,
  MoreVertical, Eye, Edit, CheckCircle2, Loader2
} from 'lucide-react'
import { coursesApi } from '@/lib/api'
import { toast } from 'sonner'

const GRADIENT_CYCLE = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-indigo-500 to-blue-400',
  'from-emerald-500 to-green-400',
  'from-amber-500 to-orange-400',
  'from-rose-500 to-pink-400',
]

interface Course {
  id: string
  title: string
  subject?: string
  description?: string
  isPublished: boolean
  updatedAt: string
  _count?: { enrollments?: number; lessons?: number }
  chapters?: { lessons?: any[] }[]
}

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', subject: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    coursesApi.getMyTeacherCourses()
      .then((r) => setCourses(r.data ?? []))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  )

  const published = courses.filter((c) => c.isPublished).length

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setCreating(true)
    try {
      const { data } = await coursesApi.create({ title: form.title, subject: form.subject })
      setCourses((prev) => [data, ...prev])
      setForm({ title: '', subject: '' })
      setShowNew(false)
      toast.success('Course created')
    } catch {
      toast.error('Failed to create course')
    } finally {
      setCreating(false)
    }
  }

  const statusChip = (isPublished: boolean) =>
    isPublished ? (
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-lg">
        <CheckCircle2 className="w-3 h-3" /> Published
      </span>
    ) : (
      <span className="text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-1 rounded-lg">
        Draft
      </span>
    )

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header
        title="My Courses"
        subtitle={loading ? 'Loading…' : `${courses.length} courses · ${published} published`}
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses…"
              className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="flex-1" />
          <Link
            href="/teacher/courses/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> New Course
          </Link>
        </div>

        {/* Quick-create inline form (fallback) */}
        {showNew && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Create Course</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {['', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'CS', 'Art'].map((s) => (
                    <option key={s} value={s}>{s || 'Select subject'}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Course Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Advanced Mathematics — Calculus"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!form.title.trim() || creating}
                className="px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Course
              </button>
            </div>
          </div>
        )}

        {/* Course grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 font-medium">No courses yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first course to get started</p>
            <Link
              href="/teacher/courses/new"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((c, i) => {
              const color = GRADIENT_CYCLE[i % GRADIENT_CYCLE.length]
              const enrollments = c._count?.enrollments ?? 0
              const lessonCount = c._count?.lessons ??
                c.chapters?.reduce((s, ch) => s + (ch.lessons?.length ?? 0), 0) ?? 0
              return (
                <div key={c.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card border border-slate-100 dark:border-slate-700 card-hover group">
                  <div className={`h-1.5 bg-gradient-to-r ${color}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        {c.subject && (
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.subject}</span>
                        )}
                        <h3 className="font-bold text-slate-900 dark:text-white mt-0.5 leading-snug line-clamp-2">{c.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {statusChip(c.isPublished)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{enrollments} students</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{lessonCount} lessons</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(c.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/student/courses/${c.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </Link>
                      <Link
                        href={`/teacher/courses/${c.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary-700 bg-primary-50 dark:bg-primary-950/40 dark:text-primary-400 hover:bg-primary-100 rounded-xl transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
