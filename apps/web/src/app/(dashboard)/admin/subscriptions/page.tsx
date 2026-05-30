'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Crown, Users, DollarSign, Hash, MoreVertical, Loader2 } from 'lucide-react';
import { subscriptionsApi } from '@/lib/api';

const PLAN_COLORS: Record<string, string> = { Free: '#94a3b8', Pro: '#3b82f6', Institution: '#8b5cf6' };

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const planStyles: Record<string, string> = {
  Free: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Institution: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function AdminSubscriptionsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionsApi.getAll()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const subs: any[] = stats?.data ?? [];
  const byPlan: Record<string, number> = stats?.byPlan ?? {};
  const mrr: number = stats?.estimatedMRR ?? 0;
  const activeCount: number = stats?.activeCount ?? 0;
  const institutionCount = byPlan['Institution'] ?? 0;

  const planData = Object.keys(byPlan).length
    ? Object.entries(byPlan).map(([name, value]) => ({ name, value, color: PLAN_COLORS[name] ?? '#64748b' }))
    : [{ name: 'Free', value: 0, color: '#94a3b8' }, { name: 'Pro', value: 0, color: '#3b82f6' }, { name: 'Institution', value: 0, color: '#8b5cf6' }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscriptions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Revenue and plan distribution overview</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Est. MRR', value: mrr > 0 ? `$${mrr.toLocaleString()}` : '$0', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Active Subs', value: activeCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Institution', value: institutionCount, icon: Crown, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Total', value: subs.length, icon: Hash, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Plan Distribution</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {planData.map((p, i) => <Cell key={i} fill={p.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {planData.map(p => (
                  <div key={p.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{p.name}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Subscription Growth</h2>
                <span className="text-xs text-slate-400">Joined over time</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={subs.slice().reverse().map((s, i) => ({ i: i + 1, month: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short' }) }))}
                  margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="i" stroke="#3b82f6" fill="url(#subGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Subscribers ({subs.length})</h2>
            </div>
            {subs.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-sm">No subscription records in the database</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      {['User', 'Plan', 'Status', 'Started', 'Expires', ''].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-500 px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {subs.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{s.user ? `${s.user.firstName} ${s.user.lastName}` : '—'}</p>
                          {s.user && <p className="text-xs text-slate-400">{s.user.email}</p>}
                        </td>
                        <td className="px-5 py-4"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planStyles[s.plan] ?? planStyles.Free}`}>{s.plan}</span></td>
                        <td className="px-5 py-4"><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusStyles[s.status] ?? 'bg-slate-100 text-slate-600'}`}>{s.status}</span></td>
                        <td className="px-5 py-4 text-sm text-slate-400">{new Date(s.startsAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4 text-sm text-slate-400">{s.endsAt ? new Date(s.endsAt).toLocaleDateString() : '—'}</td>
                        <td className="px-5 py-4"><button className="p-1 text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
