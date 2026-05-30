'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Edit3, Save, Check, Loader2 } from 'lucide-react';
import { authApi, usersApi } from '@/lib/api';

export default function StudentProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    authApi.me()
      .then((res) => {
        const u = res.data?.data ?? res.data;
        setUser(u);
        setFirstName(u.firstName ?? '');
        setLastName(u.lastName ?? '');
        setAvatarUrl(u.avatarUrl ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      const res = await usersApi.update(user.id, {
        firstName,
        lastName,
        ...(avatarUrl ? { avatarUrl } : {}),
      });
      const updated = res.data?.data ?? res.data;
      setUser(updated);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-slate-500 p-6">Unable to load profile.</p>;
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        {/* Header row */}
        <div className="flex items-center gap-5 mb-6">
          <div className="flex-shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {initials || <User className="h-8 w-8" />}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-slate-500 capitalize">
              {user.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : ''}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => { setEditing(!editing); if (editing) { setFirstName(user.firstName ?? ''); setLastName(user.lastName ?? ''); setAvatarUrl(user.avatarUrl ?? ''); } }}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <Edit3 className="h-4 w-4" />{editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Avatar URL</label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {[
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Shield, label: 'Role', value: user.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : '' },
              { icon: Calendar, label: 'Member since', value: new Date(user.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' }) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
