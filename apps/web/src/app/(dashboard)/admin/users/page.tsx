'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Search, Filter, Plus, Download, MoreVertical, Shield, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'TEACHER' | 'STUDENT' | 'PARENT' | 'ADMIN'

const users = [
  { id: '1', name: 'Sarah Mitchell', email: 'sarah@school.edu', role: 'TEACHER' as Role, school: 'Westbrook Academy', status: 'active', joined: 'Jan 12, 2026', lastActive: '2h ago' },
  { id: '2', name: 'Youssef Amrani', email: 'y.amrani@edu.ma', role: 'STUDENT' as Role, school: 'Westbrook Academy', status: 'active', joined: 'Sep 1, 2025', lastActive: '4h ago' },
  { id: '3', name: 'Marie Dupont', email: 'marie@ecole.fr', role: 'PARENT' as Role, school: 'Westbrook Academy', status: 'active', joined: 'Sep 5, 2025', lastActive: '1d ago' },
  { id: '4', name: 'Ahmed Khalil', email: 'ahmed@academy.ae', role: 'ADMIN' as Role, school: 'Dubai School Network', status: 'active', joined: 'Mar 1, 2025', lastActive: '1h ago' },
  { id: '5', name: 'Priya Patel', email: 'priya@school.edu', role: 'STUDENT' as Role, school: 'Westbrook Academy', status: 'active', joined: 'Sep 1, 2025', lastActive: '30m ago' },
  { id: '6', name: 'James Cooper', email: 'james@school.edu', role: 'TEACHER' as Role, school: 'Westbrook Academy', status: 'suspended', joined: 'Feb 15, 2026', lastActive: '3d ago' },
  { id: '7', name: 'Leila Ahmadi', email: 'leila@school.edu', role: 'TEACHER' as Role, school: 'Westbrook Academy', status: 'active', joined: 'Jan 20, 2026', lastActive: '5h ago' },
  { id: '8', name: 'Carlos Rivera', email: 'carlos@school.edu', role: 'STUDENT' as Role, school: 'Westbrook Academy', status: 'active', joined: 'Sep 1, 2025', lastActive: '2d ago' },
]

const roleColors: Record<Role, string> = {
  TEACHER: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  STUDENT: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  PARENT: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  ADMIN: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
}

const tabs = ['All', 'Teachers', 'Students', 'Parents', 'Admins'] as const
type Tab = typeof tabs[number]

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [search, setSearch] = useState('')

  const filtered = users.filter((u) => {
    const matchTab = activeTab === 'All' || u.role === activeTab.toUpperCase().slice(0, -1) as Role || u.role === activeTab.toUpperCase().slice(0, -1) + 'S'
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="User Management" subtitle={`${users.length} total users`} />
      <div className="flex-1 p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none" />
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
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                activeTab === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['User', 'Role', 'School', 'Status', 'Joined', 'Last Active', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className={cn('px-2.5 py-1 text-xs font-semibold rounded-lg', roleColors[u.role])}>{u.role}</span></td>
                    <td className="px-5 py-4 text-sm text-slate-500">{u.school}</td>
                    <td className="px-5 py-4">
                      {u.status === 'active'
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                        : <span className="flex items-center gap-1 text-xs font-semibold text-red-600"><XCircle className="w-3.5 h-3.5" /> Suspended</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{u.joined}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{u.lastActive}</td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">Showing {filtered.length} of {users.length} users</p>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-600 text-white text-xs font-semibold">1</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
