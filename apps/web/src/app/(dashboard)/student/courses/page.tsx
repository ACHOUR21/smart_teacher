'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import {
  Search, Play, Star, Users, BookOpen,
  Loader2, Plus
} from 'lucide-react'
import { coursesApi } from '@/lib/api'
import { toast } from 'sonner'

const GRADIENTS = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-green-400',
  'from-teal-500 to-cyan-400',
  'from-indigo-500 to-blue-400',
  'from-pink-500 to-rose-400',
]

interface Enrollment {
  courseId: string
  course: {
    id: string
    title: string
    subject?: string
    description?: string
    teacher?: { firstName: string; lastName: string }
    _count?: { lessons?: number }
    chapters?: { lessons?: any[] }[]
  }
}

interface Course {
  id: string
  title: string
  subject?: string
  isPublished: boolean
  teacher?: { firstName: string; lastName: string }
  _count?: { enrollments?: number; lessons?: number }
}

interface CourseProgress {
  courseId: string
  totalLessons: number
  completedLessons: number
  percentage: number
}

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({})
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      coursesApi.getMyEnrollments().then((r) => {
        const enrs: Enrollment[] = r.data ?? []
        setEnrollments(enrs)
        return enrs
      }),
      coursesApi.getAll({ isPublished: true, limit: 20 }).then((r) => {
        setAllCourses(Array.isArray(r.data) ? r.data : (r.data?.data ?? []))
      }),
    ]).then((results) => {
      const enrResult = results[0]
      if (enrResult.status === 'fulfilled') {
        const enrs = enrResult.value as Enrollment[]
        Promise.allSettled(
          enrs.map((e) =>
            coursesApi.getCourseProgress(e.course.id).then((r) => ({ courseId: e.course.id, ...r.data } as CourseProgress))
          )
        ).then((progResults) => {
          const map: Record<string, CourseProgress> = {}
          progResults.forEach((res) => {
            if (res.status === 'fulfilled') map[res.value.courseId] = res.value
          })
          setProgress(map)
        })
      }
    }).finally(() => setLoading(false))
  }, [])

  const enroll = useCallback(async (courseId: string) => {
    setEnrollingId(courseId)
    try {
      await coursesApi.enroll(courseId)
      const enrolled = allCourses.find((c) => c.id === courseId)
      if (enrolled) {
        setEnrollments((prev) => [
          ...prev,
          { courseId, course: { ...enrolled } } as Enrollment,
        ])
      }
      toast.success('Enrolled successfully!')
    } catch {
      toast.error('Failed to enroll')
    } finally {
      setEnrollingId(null)
    }
  }, [allCourses])

  const enrolledIds = new Set(enrollments.map((e) => e.course.id))

  const filteredEnrolled = enrollments.filter((e) =>
    !search || e.course.title.toLowerCase().includes(search.toLowerCase())
  )

  const discover = allCourses.filter(
    (c) => !enrolledIds.has(c.id) &&
      (!search || c.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header
        title="My Courses"
        subtitle={loading ? 'Loading…' : `${enrollments.length} enrolled · ${discover.length} available`}
      />
      <div className="flex-1 p-6 space-y-8">
        {/* Search bar */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses…"
              className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {/* Enrolled courses */}
            {filteredEnrolled.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Enrolled ({filteredEnrolled.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredEnrolled.map((e, i) => {
                    const c = e.course
                    const color = GRADIENTS[i % GRADIENTS.length]
                    const prog = progress[c.id]
                    const pct = prog?.percentage ?? 0
                    const completed = prog?.completedLessons ?? 0
                    const total = prog?.totalLessons ??
                      c._count?.lessons ??
                      c.chapters?.reduce((s, ch) => s + (ch.lessons?.length ?? 0), 0) ?? 0
                    const teacherName = c.teacher
                      ? `${c.teacher.firstName} ${c.teacher.lastName}`
                      : ''
                    return (
                      <div
                        key={c.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card border border-slate-100 dark:border-slate-700 card-hover group"
                      >
                        <div className={`h-2 bg-gradient-to-r ${color}`} />
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              {c.subject && (
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.subject}</span>
                              )}
                              <h3 className="font-bold text-slate-900 dark:text-white mt-0.5 leading-tight line-clamp-2">{c.title}</h3>
                              {teacherName && <p className="text-xs text-slate-500 mt-1">{teacherName}</p>}
                            </div>
                            {prog && (
                              <span className="text-lg font-bold text-primary-600 dark:text-primary-400 flex-shrink-0 ml-2">{pct}%</span>
                            )}
                          </div>

                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                              <span>{completed}/{total} lessons</span>
                              <span>{prog ? `${pct}%` : '…'}</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                              <div
                                className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Play className="w-3 h-3" />
                              <span className="truncate max-w-[140px]">Continue learning</span>
                            </div>
                            <Link
                              href={`/student/courses/${c.id}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Continue
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Discover section */}
            {discover.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Discover More</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {discover.slice(0, 8).map((c, i) => {
                    const color = GRADIENTS[(enrollments.length + i) % GRADIENTS.length]
                    const teacherName = c.teacher
                      ? `${c.teacher.firstName} ${c.teacher.lastName}`
                      : ''
                    const enrollments_count = c._count?.enrollments ?? 0
                    const lessons = c._count?.lessons ?? 0
                    return (
                      <div
                        key={c.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card border border-slate-100 dark:border-slate-700 card-hover flex"
                      >
                        <div className={`w-1.5 flex-shrink-0 bg-gradient-to-b ${color}`} />
                        <div className="p-5 flex-1 min-w-0">
                          {c.subject && (
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.subject}</span>
                          )}
                          <h3 className="font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">{c.title}</h3>
                          {teacherName && <p className="text-xs text-slate-500 mb-3">{teacherName}</p>}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {enrollments_count > 0 && (
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enrollments_count.toLocaleString()}</span>
                            )}
                            {lessons > 0 && (
                              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{lessons} lessons</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center pr-5">
                          <button
                            onClick={() => enroll(c.id)}
                            disabled={enrollingId === c.id}
                            className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                          >
                            {enrollingId === c.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Plus className="w-3 h-3" />}
                            Enroll
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {filteredEnrolled.length === 0 && discover.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium text-slate-600 dark:text-slate-300">No courses found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
