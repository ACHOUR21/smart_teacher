'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import { Search, Filter, Plus, Download, MoreVertical, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usersApi } from '@/lib/api'
import { toast } from 'sonner'

type Role = 'TEACHER' | 'STUDENT' | 'PARENT' | 'ADMIN'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

const roleColors: Record<Role, string> = {
  TEACHER: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  STUDENT: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  PARENT: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  ADMIN: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
}

const TABS = ['All', 'Teachers', 'Students', 'Parents', 'Admins'] as const
type Tab = typeof TABS[number]

const TAB_ROLE: Record<Tab, Role | null> = {
  All: null,
  Teachers: 'TEACHER',
  Students: 'STUDENT',
  Parents: 'PARENT',
  Admins: 'ADMIN',
}

const PAGE_SIZE = 15

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { page, limit: PAGE_SIZE }
      if (search) params.search = search
      const roleFilter = TAB_ROLE[activeTab]
      if (roleFilter) params.role = roleFilter
      const { data } = await usersApi.getAll(params)
      // Backend may return { data, total } or a plain array
      if (Array.isArray(data)) {
        setUsers(data)
        setTotal(data.length)
      } else {
        setUsers(data.data ?? data.users ?? [])
        setTotal(data.total ?? data.count ?? 0)
      }
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [activeTab, search, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [activeTab, search])

  const toggleStatus = async (u: User) => {
    setTogglingId(u.id)
    try {
      await usersApi.setActive(u.id, !u.isActive)
      setUsers((prev) =>
        prev.map((x) => x.id === u.id ? { ...x, isActive: !u.isActive } : x)
      )
      toast.success(`User ${u.isActive ? 'suspended' : 'activated'}`)
    } catch {
      toast.error('Failed to update user status')
    } finally {
      setTogglingId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header
        title="User Management"
        subtitle={loading ? 'Loading…' : `${total} total users`}
      />
      <div className="flex-1 p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* Role tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                activeTab === t
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {['User', 'Role', 'Status', 'Joined', 'Last Login', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No users found</td>
                    </tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(u.firstName[0] + u.lastName[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('px-2.5 py-1 text-xs font-semibold rounded-lg', roleColors[u.role])}>{u.role}</span>
                      </td>
                      <td className="px-5 py-4">
                        {u.isActive
                          ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                          : <span className="flex items-center gap-1 text-xs font-semibold text-red-600"><XCircle className="w-3.5 h-3.5" /> Suspended</span>}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleStatus(u)}
                          disabled={togglingId === u.id}
                          title={u.isActive ? 'Suspend user' : 'Activate user'}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                        >
                          {togglingId === u.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <MoreVertical className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">
              Showing {users.length} of {total} users
            </p>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors',
                    page === p
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
