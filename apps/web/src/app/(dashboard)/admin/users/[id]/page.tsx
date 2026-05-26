'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, Mail, Phone, Calendar, BookOpen,
  TrendingUp, AlertTriangle, CheckCircle2, Ban, Edit3, Save
} from 'lucide-react';
import Link from 'next/link';

const user = {
  id: 'usr_001',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@student.edu',
  phone: '+1 555-0198',
  role: 'STUDENT',
  status: 'active',
  gradeLevel: '11th Grade',
  joinedAt: 'January 15, 2026',
  lastLogin: '2 hours ago',
  avatar: 'SJ',
  enrollments: 4,
  avgGrade: 91.2,
  aiSessions: 23,
  submissions: 18,
};

const activityLog = [
  { action: 'Submitted assignment', detail: 'Derivatives Practice Set', time: '2h ago', icon: BookOpen, color: 'text-blue-500' },
  { action: 'AI Tutor session', detail: 'Calculus help (42 min)', time: '5h ago', icon: TrendingUp, color: 'text-purple-500' },
  { action: 'Joined live session', detail: 'Advanced Mathematics Review', time: 'Yesterday', icon: CheckCircle2, color: 'text-green-500' },
  { action: 'Enrolled in course', detail: 'World History', time: '3 days ago', icon: BookOpen, color: 'text-amber-500' },
  { action: 'Account created', detail: 'via email registration', time: 'Jan 15, 2026', icon: Shield, color: 'text-slate-500' },
];

const roleColors: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  TEACHER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PARENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminUserDetailPage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  const [saved, setSaved] = useState(false);

  function save() {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/users" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to users
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Detail</h1>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">
                <Save className="h-4 w-4" />{saved ? 'Saved!' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium">
              <Edit3 className="h-4 w-4" /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
              {user.avatar}
            </div>
            {editing ? (
              <input value={name} onChange={e => setName(e.target.value)}
                className="text-base font-bold text-center bg-transparent border-b border-primary-500 outline-none text-slate-900 dark:text-white w-full" />
            ) : (
              <p className="font-bold text-slate-900 dark:text-white">{name}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {editing ? (
                <select value={role} onChange={e => setRole(e.target.value)}
                  className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {['STUDENT','TEACHER','PARENT','ADMIN'].map(r => <option key={r}>{r}</option>)}
                </select>
              ) : (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[role]}`}>{role}</span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'
              }`}>{status}</span>
            </div>
          </div>

          <div className="space-y-3">
            {[{ icon: Mail, label: 'Email', value: email, editable: true, setValue: setEmail },
              { icon: Phone, label: 'Phone', value: user.phone, editable: false },
              { icon: Calendar, label: 'Joined', value: user.joinedAt, editable: false },
              { icon: Shield, label: 'Last login', value: user.lastLogin, editable: false },
            ].map(({ icon: Icon, label, value, editable, setValue }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
                  {editing && editable && setValue ? (
                    <input value={value} onChange={e => setValue(e.target.value)}
                      className="text-sm bg-transparent border-b border-primary-500 outline-none text-slate-900 dark:text-white w-full" />
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <button
              onClick={() => setStatus(s => s === 'active' ? 'suspended' : 'active')}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${
                status === 'active'
                  ? 'border border-red-200 text-red-600 hover:bg-red-50'
                  : 'border border-green-200 text-green-600 hover:bg-green-50'
              }`}
            >
              {status === 'active' ? <><Ban className="h-4 w-4" /> Suspend User</> : <><CheckCircle2 className="h-4 w-4" /> Reactivate User</>}
            </button>
          </div>
        </motion.div>

        {/* Stats + activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Enrollments', value: user.enrollments },
              { label: 'Avg Grade', value: `${user.avgGrade}%` },
              { label: 'AI Sessions', value: user.aiSessions },
              { label: 'Submissions', value: user.submissions },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Activity log */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Activity Log</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {activityLog.map((log, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <log.icon className={`h-4 w-4 ${log.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{log.action}</p>
                    <p className="text-xs text-slate-500">{log.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
