'use client';

import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Crown, Users, DollarSign, TrendingUp, MoreVertical } from 'lucide-react';

const planData = [
  { name: 'Free', value: 3241, color: '#94a3b8' },
  { name: 'Pro', value: 1847, color: '#3b82f6' },
  { name: 'Institution', value: 312, color: '#8b5cf6' },
];

const revenueHistory = [
  { month: 'Dec', mrr: 38000 },
  { month: 'Jan', mrr: 42000 },
  { month: 'Feb', mrr: 45500 },
  { month: 'Mar', mrr: 47200 },
  { month: 'Apr', mrr: 51800 },
  { month: 'May', mrr: 54300 },
];

const subscribers = [
  { name: 'Al-Noor Academy', plan: 'Institution', seats: 450, amount: '$1,800/mo', status: 'active', since: 'Sep 2025' },
  { name: 'Bright Minds School', plan: 'Institution', seats: 280, amount: '$1,120/mo', status: 'active', since: 'Jan 2026' },
  { name: 'Ahmed Al-Rashid', plan: 'Pro', seats: 1, amount: '$29/mo', status: 'active', since: 'Mar 2026' },
  { name: 'Sarah Johnson', plan: 'Pro', seats: 1, amount: '$29/mo', status: 'active', since: 'Apr 2026' },
  { name: 'Tech High School', plan: 'Institution', seats: 620, amount: '$2,480/mo', status: 'trial', since: 'May 2026' },
  { name: 'Emma Wilson', plan: 'Pro', seats: 1, amount: '$29/mo', status: 'cancelled', since: 'Feb 2026' },
];

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
  const totalMRR = 54300;
  const activeCount = subscribers.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscriptions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Revenue and plan distribution overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: `$${(totalMRR / 1000).toFixed(1)}K`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Active Subs', value: activeCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Institution Plans', value: planData[2].value, icon: Crown, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'MRR Growth', value: '+12%', icon: TrendingUp, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
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
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">MRR Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueHistory} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v / 1000}K`} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="mrr" stroke="#3b82f6" fill="url(#mrrGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Subscribers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50">
                {['Name', 'Plan', 'Seats', 'Amount', 'Status', 'Since', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {subscribers.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-slate-900 dark:text-white">{s.name}</td>
                  <td className="px-5 py-4"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planStyles[s.plan]}`}>{s.plan}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{s.seats}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">{s.amount}</td>
                  <td className="px-5 py-4"><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusStyles[s.status]}`}>{s.status}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-400">{s.since}</td>
                  <td className="px-5 py-4"><button className="p-1 text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
