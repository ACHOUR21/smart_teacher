'use client'

import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Users, BookOpen, CreditCard, TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const userGrowth = [
  { month: 'Oct', students: 8200, teachers: 320, parents: 4100 },
  { month: 'Nov', students: 9100, teachers: 348, parents: 4500 },
  { month: 'Dec', students: 9800, teachers: 360, parents: 4800 },
  { month: 'Jan', students: 10500, teachers: 380, parents: 5200 },
  { month: 'Feb', students: 11200, teachers: 400, parents: 5600 },
  { month: 'Mar', students: 11800, teachers: 412, parents: 5900 },
  { month: 'Apr', students: 12100, teachers: 428, parents: 6100 },
  { month: 'May', students: 12483, teachers: 445, parents: 6241 },
]

const revenueData = [
  { month: 'Oct', mrr: 31200 },
  { month: 'Nov', mrr: 33800 },
  { month: 'Dec', mrr: 35100 },
  { month: 'Jan', mrr: 37500 },
  { month: 'Feb', mrr: 39200 },
  { month: 'Mar', mrr: 41800 },
  { month: 'Apr', mrr: 44300 },
  { month: 'May', mrr: 48200 },
]

const planDist = [
  { name: 'Free', value: 8241, color: '#94a3b8' },
  { name: 'Pro', value: 3124, color: '#0c84e8' },
  { name: 'Institution', value: 1118, color: '#00e88b' },
]

const topCourses = [
  { title: 'Advanced Mathematics', enrollments: 3240 },
  { title: 'English Literature', enrollments: 2980 },
  { title: 'Physics 101', enrollments: 2610 },
  { title: 'World History', enrollments: 2200 },
  { title: 'Chemistry Fundamentals', enrollments: 1980 },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Platform Analytics" subtitle="Insights across your entire platform" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard title="Total Users" value="12,483" icon={Users} gradient="from-blue-500 to-cyan-400" trend={{ value: 8, label: 'vs last month' }} />
          <StatsCard title="Active Courses" value="2,418" icon={BookOpen} gradient="from-violet-500 to-purple-400" trend={{ value: 15, label: 'vs last month' }} />
          <StatsCard title="MRR" value="$48.2K" icon={CreditCard} gradient="from-emerald-500 to-green-400" trend={{ value: 22, label: 'vs last month' }} />
          <StatsCard title="Avg. Grade" value="84%" icon={TrendingUp} gradient="from-amber-500 to-orange-400" trend={{ value: 3, label: 'vs last semester' }} />
        </div>

        {/* User growth */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">User Growth</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="gStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0c84e8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0c84e8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gTeachers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="students" stroke="#0c84e8" strokeWidth={2} fill="url(#gStudents)" name="Students" />
              <Area type="monotone" dataKey="teachers" stroke="#8b5cf6" strokeWidth={2} fill="url(#gTeachers)" name="Teachers" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Monthly Recurring Revenue</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`$${(v/1000).toFixed(1)}K`, 'MRR']} />
                <Bar dataKey="mrr" fill="url(#revenueGrad)" radius={[6,6,0,0]} />
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Plan distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Subscription Plans</h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={planDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {planDist.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {planDist.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{p.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top courses */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Top Courses by Enrollment</h2>
          <div className="space-y-3">
            {topCourses.map((c, i) => (
              <div key={c.title} className="flex items-center gap-4">
                <span className="text-lg font-bold text-slate-300 dark:text-slate-600 w-6 text-center">{i + 1}</span>
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{c.title}</span>
                <div className="flex items-center gap-3 w-48">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(c.enrollments / topCourses[0].enrollments) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 w-12 text-right">{c.enrollments.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
