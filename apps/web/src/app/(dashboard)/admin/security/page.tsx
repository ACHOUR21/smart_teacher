'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, Clock, User, LogIn, Settings, Trash2 } from 'lucide-react';

const auditLogs = [
  { id: 1, user: 'admin@platform.edu', action: 'USER_SUSPENDED', target: 'user:james.doe@email.com', ip: '192.168.1.45', time: '2 minutes ago', severity: 'warning' },
  { id: 2, user: 'sarah.johnson@school.edu', action: 'LOGIN_SUCCESS', target: 'self', ip: '10.0.0.12', time: '5 minutes ago', severity: 'info' },
  { id: 3, user: 'mr.alrashid@school.edu', action: 'COURSE_PUBLISHED', target: 'course:advanced-math', ip: '10.0.0.88', time: '12 minutes ago', severity: 'info' },
  { id: 4, user: 'unknown', action: 'LOGIN_FAILED', target: 'admin@platform.edu', ip: '203.0.113.42', time: '18 minutes ago', severity: 'danger' },
  { id: 5, user: 'unknown', action: 'LOGIN_FAILED', target: 'admin@platform.edu', ip: '203.0.113.42', time: '18 minutes ago', severity: 'danger' },
  { id: 6, user: 'admin@platform.edu', action: 'ROLE_CHANGED', target: 'user:emma.wilson → TEACHER', ip: '192.168.1.45', time: '1 hour ago', severity: 'warning' },
  { id: 7, user: 'system', action: 'BACKUP_COMPLETED', target: 'database:prod', ip: '—', time: '2 hours ago', severity: 'success' },
  { id: 8, user: 'admin@platform.edu', action: 'COURSE_DELETED', target: 'course:old-curriculum', ip: '192.168.1.45', time: '3 hours ago', severity: 'warning' },
];

const alerts = [
  { title: 'Brute-force attempt detected', desc: '5 failed logins from IP 203.0.113.42 in 20 minutes', severity: 'danger', time: '18 min ago' },
  { title: 'Unusual admin activity', desc: 'Admin suspended 3 accounts in rapid succession', severity: 'warning', time: '45 min ago' },
  { title: 'Database backup successful', desc: 'Full backup completed to secure storage', severity: 'success', time: '2h ago' },
];

const severityConfig = {
  info: { icon: LogIn, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  danger: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
};

const alertBg = {
  danger: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
  success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
};

const alertText = {
  danger: 'text-red-700 dark:text-red-400',
  warning: 'text-amber-700 dark:text-amber-400',
  success: 'text-green-700 dark:text-green-400',
};

export default function AdminSecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security & Audit Log</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor platform security events and user actions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Sessions', value: '1,284', icon: User, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Failed Logins (24h)', value: '12', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Security Alerts', value: '2', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Last Backup', value: '2h ago', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
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

      {/* Security alerts */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Active Alerts</h2>
        {alerts.map((a, i) => {
          const s = a.severity as keyof typeof alertBg;
          const Icon = severityConfig[s].icon;
          return (
            <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border ${alertBg[s]}`}>
              <Icon className={`h-5 w-5 mt-0.5 ${severityConfig[s].color}`} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${alertText[s]}`}>{a.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{a.time}</span>
            </div>
          );
        })}
      </motion.div>

      {/* Audit log */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Audit Log</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {auditLogs.map(log => {
            const cfg = severityConfig[log.severity as keyof typeof severityConfig];
            const Icon = cfg.icon;
            return (
              <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className={`h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{log.action}</code>
                    <span className="text-xs text-slate-500 truncate">{log.target}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{log.user} · IP {log.ip}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{log.time}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
