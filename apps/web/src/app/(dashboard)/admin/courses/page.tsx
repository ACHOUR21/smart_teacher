'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, BookOpen, Users, MoreVertical, Loader2, CheckCircle2 } from 'lucide-react'
import { coursesApi } from '@/lib/api'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  subject?: string
  isPublished: boolean
  createdAt: string
  teacher?: { firstName: string; lastName: string }
  _count?: { enrollments?: number; lessons?: number }
}

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    coursesApi.getAll({ limit: 100 })
      .then((r) => {
        const data = r.data
        setCourses(Array.isArray(data) ? data : (data.data ?? []))
      })
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter((c) =>
    !query ||
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    (c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}`.toLowerCase().includes(query.toLowerCase()) : false)
  )

  const published = courses.filter((c) => c.isPublished).length
  const drafts = courses.filter((c) => !c.isPublished).length
  const totalEnrollments = courses.reduce((s, c) => s + (c._count?.enrollments ?? 0), 0)

  const togglePublish = async (c: Course) => {
    setTogglingId(c.id)
    try {
      await coursesApi.update(c.id, { isPublished: !c.isPublished })
      setCourses((prev) =>
        prev.map((x) => x.id === c.id ? { ...x, isPublished: !c.isPublished } : x)
      )
      toast.success(c.isPublished ? 'Course unpublished' : 'Course published')
    } catch {
      toast.error('Failed to update course')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Courses</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all courses on the platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: loading ? '…' : courses.length },
          { label: 'Published', value: loading ? '…' : published },
          { label: 'Draft', value: loading ? '…' : drafts },
          { label: 'Total Enrollments', value: loading ? '…' : totalEnrollments },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
            placeholder="Search courses or teachers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50">
                  {['Course', 'Teacher', 'Enrollments', 'Lessons', 'Status', 'Created', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No courses found</td>
                  </tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{c.title}</p>
                          {c.subject && <p className="text-xs text-slate-400">{c.subject}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <Users className="h-3.5 w-3.5" />{c._count?.enrollments ?? 0}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {c._count?.lessons ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        c.isPublished ? STATUS_STYLES.published : STATUS_STYLES.draft
                      }`}>
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => togglePublish(c)}
                        disabled={togglingId === c.id}
                        title={c.isPublished ? 'Unpublish' : 'Publish'}
                        className="p-1 text-slate-400 hover:text-primary-600 disabled:opacity-50 transition-colors"
                      >
                        {togglingId === c.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <CheckCircle2 className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
