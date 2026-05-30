'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Search, Mail, TrendingDown, Download, Loader2, Users } from 'lucide-react'
import Link from 'next/link'
import { usersApi } from '@/lib/api'
import { toast } from 'sonner'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
  _count?: { enrollments?: number }
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    usersApi.getAll({ role: 'STUDENT', limit: 100 })
      .then((r) => {
        const data = r.data
        setStudents(Array.isArray(data) ? data : (data.data ?? data.users ?? []))
      })
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter((s) => {
    if (!search) return true
    const name = `${s.firstName} ${s.lastName}`.toLowerCase()
    return name.includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  })

  const inactive = students.filter((s) => !s.isActive)

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header
        title="Students"
        subtitle={loading ? 'Loading…' : `${students.length} students${inactive.length > 0 ? ` · ${inactive.length} inactive` : ''}`}
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Alert for inactive students */}
        {!loading && inactive.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-400 text-sm">{inactive.length} inactive student{inactive.length > 1 ? 's' : ''}</p>
              <p className="text-sm text-amber-700 dark:text-amber-500">
                {inactive.slice(0, 3).map((s) => `${s.firstName} ${s.lastName}`).join(', ')}
                {inactive.length > 3 ? ` and ${inactive.length - 3} more` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students…"
              className="flex-1 text-sm bg-transparent placeholder:text-slate-400 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-slate-600 dark:text-slate-300">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {['Student', 'Enrolled Courses', 'Joined', 'Last Login', 'Status', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {s.firstName[0]}{s.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-slate-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {s._count?.enrollments ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {s.isActive
                          ? <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-lg">Active</span>
                          : <span className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-lg">Inactive</span>}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/teacher/students/${s.id}`}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 hover:text-primary-600 transition-colors inline-flex"
                        >
                          <Mail className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
