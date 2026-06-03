'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Download, Users, BookOpen, Brain, Activity, Loader2 } from 'lucide-react';
import { analyticsApi } from '@/lib/api';

const USER_GROWTH_FALLBACK = [
  { month: 'Nov', students: 3800, teachers: 180 },
  { month: 'Dec', students: 4100, teachers: 195 },
  { month: 'Jan', students: 4500, teachers: 210 },
  { month: 'Feb', students: 4900, teachers: 225 },
  { month: 'Mar', students: 5300, teachers: 240 },
  { month: 'Apr', students: 5800, teachers: 258 },
  { month: 'May', students: 6200, teachers: 274 },
];

const ENGAGEMENT_FALLBACK = [
  { week: 'W1', sessions: 1240, aiChats: 380 },
  { week: 'W2', sessions: 1380, aiChats: 420 },
  { week: 'W3', sessions: 1520, aiChats: 490 },
  { week: 'W4', sessions: 1310, aiChats: 450 },
  { week: 'W5', sessions: 1680, aiChats: 530 },
  { week: 'W6', sessions: 1790, aiChats: 580 },
];

const COMPLETION_FALLBACK = [
  { subject: 'Math', rate: 78 },
  { subject: 'Physics', rate: 65 },
  { subject: 'English', rate: 84 },
  { subject: 'History', rate: 72 },
  { subject: 'Arabic', rate: 88 },
  { subject: 'PE', rate: 91 },
];

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [completionData, setCompletionData] = useState<any[]>([]);

  useEffect(() => {
    analyticsApi.admin()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));

    analyticsApi.adminWeeklyEngagement(6)
      .then((res) => {
        const d = res.data;
        const arr = Array.isArray(d) ? d : (d?.data ?? []);
        setEngagementData(arr.length > 0 ? arr : ENGAGEMENT_FALLBACK);
      })
      .catch(() => setEngagementData(ENGAGEMENT_FALLBACK));

    analyticsApi.completionByCategory()
      .then((res) => {
        const d = res.data;
        const arr = Array.isArray(d) ? d : (d?.data ?? []);
        setCompletionData(arr.length > 0 ? arr : COMPLETION_FALLBACK);
      })
      .catch(() => setCompletionData(COMPLETION_FALLBACK));
  }, []);

  const totalUsers = stats
    ? (Object.values(stats.users?.byRole ?? {}) as number[]).reduce((a, b) => a + b, 0)
    : null;

  const kpis = [
    {
      label: 'Total Users',
      value: loading ? '…' : (totalUsers ?? '—').toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Active Courses',
      value: loading ? '…' : String(stats?.courses?.published ?? '—'),
      icon: BookOpen,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'AI Sessions',
      value: loading ? '…' : String(stats?.activity?.aiSessions ?? '—'),
      icon: Brain,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Enrollments (30d)',
      value: loading ? '…' : String(stats?.activity?.recentEnrollments ?? '—'),
      icon: Activity,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  const userGrowth = stats?.users?.trend
    ? stats.users.trend.map((t: any) => ({
        month: t.month,
        students: t.students,
        teachers: t.teachers,
      }))
    : USER_GROWTH_FALLBACK;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports &amp; Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Platform-wide performance insights</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className={`h-9 w-9 rounded-xl ${k.bg} flex items-center justify-center mb-3`}>
              {loading
                ? <Loader2 className={`h-5 w-5 ${k.color} animate-spin`} />
                : <k.icon className={`h-5 w-5 ${k.color}`} />}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* User Growth */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">New User Registrations</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={userGrowth} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="studGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="teachGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="students" stroke="#3b82f6" fill="url(#studGrad)" strokeWidth={2} name="Students" />
            <Area type="monotone" dataKey="teachers" stroke="#22c55e" fill="url(#teachGrad)" strokeWidth={2} name="Teachers" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Weekly Engagement</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={engagementData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} dot={false} name="Live Attendance" />
              <Line type="monotone" dataKey="aiChats" stroke="#8b5cf6" strokeWidth={2} dot={false} name="AI Sessions" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Course completion */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Completion Rate by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={completionData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="subject" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="rate" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Completion" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Courses breakdown from real data */}
      {stats?.courses && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Courses Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.courses.published}</p>
              <p className="text-sm text-green-600 dark:text-green-500">Published</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.courses.draft}</p>
              <p className="text-sm text-gray-500">Draft</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.courses.total}</p>
              <p className="text-sm text-blue-600 dark:text-blue-500">Total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
