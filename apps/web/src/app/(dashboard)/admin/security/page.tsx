'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, LogIn, User, Loader2 } from 'lucide-react';
import { analyticsApi } from '@/lib/api';

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { email: string; firstName: string; lastName: string } | null;
}

type Severity = 'info' | 'warning' | 'danger' | 'success';

const severityConfig: Record<Severity, { icon: React.ElementType; color: string; bg: string }> = {
  info:    { icon: LogIn,          color: 'text-blue-500',  bg: 'bg-blue-50 dark:bg-blue-900/20' },
  warning: { icon: AlertTriangle,  color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  danger:  { icon: AlertTriangle,  color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20' },
  success: { icon: CheckCircle2,   color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
};

function actionSeverity(action: string): Severity {
  const a = (action ?? '').toUpperCase();
  if (a.includes('FAIL') || a.includes('ERROR') || a.includes('BLOCK') || a.includes('INVALID')) return 'danger';
  if (a.includes('DELETE') || a.includes('SUSPEND') || a.includes('REVOKE') || a.includes('ROLE') || a.includes('BAN')) return 'warning';
  if (a.includes('BACKUP') || a.includes('RESTORE') || a.includes('COMPLET') || a.includes('SUCCESS')) return 'success';
  return 'info';
}

function timeAgo(date: string) {
  const ms = Date.now() - new Date(date).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.auditLogs({ limit: 30 })
      .then((res) => {
        const data = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
        setLogs(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const since24h = new Date(Date.now() - 86400000);
  const failedLogins = logs.filter(
    (l) => l.action?.toUpperCase().includes('LOGIN_FAIL') && new Date(l.createdAt) >= since24h
  ).length;
  const dangerAlerts = logs.filter(
    (l) => actionSeverity(l.action) === 'danger' && new Date(l.createdAt) >= since24h
  ).length;
  const lastBackupLog = logs.find((l) => l.action?.toUpperCase().includes('BACKUP'));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security &amp; Audit Log</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor platform security events and user actions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Sessions', value: loading ? '…' : '—', icon: User, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Failed Logins (24h)', value: loading ? '…' : String(failedLogins), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Security Alerts', value: loading ? '…' : String(dangerAlerts), icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          {
            label: 'Last Backup',
            value: loading ? '…' : lastBackupLog ? timeAgo(lastBackupLog.createdAt) : 'N/A',
            icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20',
          },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              {loading ? <Loader2 className={`h-5 w-5 ${s.color} animate-spin`} /> : <s.icon className={`h-5 w-5 ${s.color}`} />}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Audit log */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Audit Log</h2>
          {!loading && <span className="text-xs text-slate-400">{logs.length} events</span>}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No audit log entries yet</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {logs.map((log) => {
              const sev = actionSeverity(log.action);
              const cfg = severityConfig[sev];
              const Icon = cfg.icon;
              const userLabel = log.user?.email ?? 'system';
              const target = [log.entity, log.entityId].filter(Boolean).join(':') || '—';
              return (
                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className={`h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        {log.action}
                      </code>
                      <span className="text-xs text-slate-500 truncate">{target}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {userLabel} · IP {log.ipAddress ?? '—'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(log.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
