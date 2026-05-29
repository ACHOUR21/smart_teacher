'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Users, BookOpen, BarChart3, CreditCard, Shield, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { analyticsApi, usersApi, notificationsApi } from '@/lib/api';

const roleColors: Record<string, string> = {
  TEACHER: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  STUDENT: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  PARENT: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  ADMIN: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
};

const FALLBACK_ALERTS = [
  { type: 'info', message: 'Scheduled maintenance: June 1, 2:00–4:00 AM UTC' },
  { type: 'warning', message: '3 failed login attempts detected' },
  { type: 'info', message: 'AI quota at 78% for this billing cycle' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<{ type: string; message: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.admin(),
      usersApi.getAll({ limit: 5, orderBy: 'createdAt', orderDir: 'desc' }),
      notificationsApi.getAll({ type: 'SYSTEM', limit: 3 }),
    ]).then(([statsRes, usersRes, alertsRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (usersRes.status === 'fulfilled') {
        const d = usersRes.value.data;
        setRecentUsers(Array.isArray(d) ? d : (d?.data ?? d?.users ?? []));
      }
      if (alertsRes.status === 'fulfilled') {
        const d = alertsRes.value.data;
        const notifs = Array.isArray(d) ? d : (d?.data ?? []);
        setAlerts(notifs.slice(0, 3).map((a: any) => ({
          type: a.type === 'warning' || a.priority === 'high' ? 'warning' : 'info',
          message: a.message ?? a.body ?? a.title ?? '',
        })));
      }
      setLoading(false);
    });
  }, []);

  const totalUsers = stats
    ? (Object.values(stats.users?.byRole ?? {}) as number[]).reduce((a, b) => a + b, 0)
    : null;

  const statCards = [
    {
      title: 'Total Users',
      value: loading ? '…' : (totalUsers ?? '—').toLocaleString(),
      subtitle: `${stats?.users?.byRole?.STUDENT ?? 0} students`,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-400',
      trend: { value: 8, label: 'vs last month' },
    },
    {
      title: 'Active Courses',
      value: loading ? '…' : String(stats?.courses?.published ?? '—'),
      subtitle: `${stats?.courses?.total ?? 0} total`,
      icon: BookOpen,
      gradient: 'from-violet-500 to-purple-400',
      trend: { value: 15, label: 'vs last month' },
    },
    {
      title: 'Recent Enrollments',
      value: loading ? '…' : String(stats?.activity?.recentEnrollments ?? '—'),
      subtitle: 'last 30 days',
      icon: CreditCard,
      gradient: 'from-emerald-500 to-green-400',
      trend: { value: 22, label: 'vs last month' },
    },
    {
      title: 'AI Sessions',
      value: loading ? '…' : String(stats?.activity?.aiSessions ?? '—'),
      subtitle: 'total AI interactions',
      icon: Shield,
      gradient: 'from-amber-500 to-orange-400',
      trend: { value: 0, label: 'stable' },
    },
  ];

  const displayAlerts = alerts.length > 0 ? alerts : FALLBACK_ALERTS;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Admin Dashboard" subtitle="Platform overview" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => <StatsCard key={s.title} {...s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent users */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900 dark:text-white">Recent Users</h2>
              <Link href="/admin/users" className="text-xs text-primary-600 font-medium hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : recentUsers.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No users yet.</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => {
                  const initials = (user.name ?? user.email ?? 'U')
                    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                  const joinedDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—';
                  return (
                    <Link key={user.id} href={`/admin/users/${user.id}`}
                      className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-xl p-1 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name ?? '—'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 ${roleColors[user.role] ?? ''}`}>
                        {user.role}
                      </span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{joinedDate}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* System alerts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">System Alerts</h2>
            <div className="space-y-3">
              {displayAlerts.map((alert, i) => (
                <div key={i} className={`p-3 rounded-xl flex items-start gap-2.5 ${
                  alert.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30'
                    : 'bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30'
                }`}>
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-xs font-medium text-primary-600 border border-primary-200 dark:border-primary-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors">
              View all alerts
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Manage Users', icon: Users, color: 'from-blue-500 to-cyan-400', href: '/admin/users' },
              { label: 'Manage Courses', icon: BookOpen, color: 'from-violet-500 to-purple-400', href: '/admin/courses' },
              { label: 'View Analytics', icon: BarChart3, color: 'from-emerald-500 to-green-400', href: '/admin/analytics' },
              { label: 'Security Log', icon: Shield, color: 'from-amber-500 to-orange-400', href: '/admin/security' },
            ].map((action) => (
              <Link key={action.label} href={action.href}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
