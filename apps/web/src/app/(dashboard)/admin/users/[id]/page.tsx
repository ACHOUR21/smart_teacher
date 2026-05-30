'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, Mail, Phone, Calendar,
  CheckCircle2, Ban, Edit3, Save, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usersApi } from '@/lib/api';

const roleColors: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  TEACHER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PARENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!id) return;
    usersApi.getOne(id)
      .then((res) => {
        const u = res.data?.data ?? res.data;
        setUserData(u);
        setName(u.name ?? '');
        setEmail(u.email ?? '');
        setRole(u.role ?? 'STUDENT');
        setIsActive(u.isActive ?? true);
      })
      .catch(() => setUserData(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function save() {
    if (!id) return;
    setSaving(true);
    try {
      await usersApi.update(id, { name, email, role });
      setUserData((prev: any) => ({ ...prev, name, email, role }));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    if (!id) return;
    const next = !isActive;
    setIsActive(next);
    try {
      await usersApi.setActive(id, next);
    } catch {
      setIsActive(!next);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="space-y-4">
        <Link href="/admin/users" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to users
        </Link>
        <p className="text-slate-500">User not found.</p>
      </div>
    );
  }

  const avatar = (userData.name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const joinedAt = userData.createdAt
    ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';
  const lastLogin = userData.lastLogin
    ? new Date(userData.lastLogin).toLocaleDateString()
    : '—';

  const statItems = [
    { label: 'Enrollments', value: userData._count?.enrollments ?? userData.enrollmentCount ?? '—' },
    { label: 'Submissions', value: userData._count?.submissions ?? '—' },
    { label: 'AI Sessions', value: userData._count?.aiSessions ?? '—' },
    { label: 'Messages', value: userData._count?.messages ?? '—' },
  ];

  const infoRows = [
    { label: 'User ID', value: userData.id },
    { label: 'Email verified', value: userData.emailVerified ? 'Yes' : 'No' },
    { label: 'Grade level', value: userData.gradeLevel ?? '—' },
    { label: 'Subject', value: userData.subject ?? '—' },
  ];

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
              <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium disabled:opacity-70">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saved ? 'Saved!' : 'Save'}
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
              {avatar}
            </div>
            {editing ? (
              <input value={name} onChange={e => setName(e.target.value)}
                className="text-base font-bold text-center bg-transparent border-b border-primary-500 outline-none text-slate-900 dark:text-white w-full" />
            ) : (
              <p className="font-bold text-slate-900 dark:text-white">{name}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
              {editing ? (
                <select value={role} onChange={e => setRole(e.target.value)}
                  className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'].map(r => <option key={r}>{r}</option>)}
                </select>
              ) : (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[role] ?? roleColors.STUDENT}`}>{role}</span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>{isActive ? 'Active' : 'Suspended'}</span>
            </div>
          </div>

          <div className="space-y-3">
            {([
              { icon: Mail, label: 'Email', value: email, editable: true, setter: setEmail },
              { icon: Phone, label: 'Phone', value: userData.phone ?? '—', editable: false, setter: null },
              { icon: Calendar, label: 'Joined', value: joinedAt, editable: false, setter: null },
              { icon: Shield, label: 'Last login', value: lastLogin, editable: false, setter: null },
            ] as const).map(({ icon: Icon, label, value, editable, setter }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
                  {editing && editable && setter ? (
                    <input value={value} onChange={e => (setter as any)(e.target.value)}
                      className="text-sm bg-transparent border-b border-primary-500 outline-none text-slate-900 dark:text-white w-full" />
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={toggleStatus}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                  : 'border border-green-200 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
              }`}
            >
              {isActive
                ? <><Ban className="h-4 w-4" /> Suspend User</>
                : <><CheckCircle2 className="h-4 w-4" /> Reactivate User</>}
            </button>
          </div>
        </motion.div>

        {/* Stats + info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statItems.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Account Details</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white font-mono break-all">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
