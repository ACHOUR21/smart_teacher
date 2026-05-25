'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Bell, Shield, Palette, Save, Camera } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  bio: z.string().max(300, 'Max 300 chars').optional(),
  subject: z.string().optional(),
  department: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

export default function TeacherSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({
    newSubmission: true,
    parentMessage: true,
    liveReminder: true,
    weeklyReport: false,
    systemAlerts: true,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      email: 'ahmed@school.edu',
      phone: '+1 555-0142',
      bio: 'Mathematics teacher with 10 years of experience in advanced calculus and physics.',
      subject: 'Mathematics',
      department: 'STEM',
    },
  });

  function onSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                  AR
                </div>
                <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Ahmed Al-Rashid</p>
                <p className="text-sm text-slate-500">Mathematics Teacher · STEM Department</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([['firstName', 'First Name'], ['lastName', 'Last Name'], ['email', 'Email'], ['phone', 'Phone'], ['subject', 'Subject'], ['department', 'Department']] as const).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
                    <input
                      {...register(field)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                    {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]?.message}</p>}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                  <Save className="h-4 w-4" />
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Email & Push Notifications</h2>
            {([
              ['newSubmission', 'New assignment submission', 'When a student submits an assignment'],
              ['parentMessage', 'Parent message', 'When a parent sends you a message'],
              ['liveReminder', 'Live session reminder', '15 minutes before a live session starts'],
              ['weeklyReport', 'Weekly class report', 'Summary of class performance each Sunday'],
              ['systemAlerts', 'System alerts', 'Important platform announcements'],
            ] as const).map(([key, title, desc]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                </div>
                <Toggle checked={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</h2>
            {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
              <div key={label}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                <input type="password" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
              </div>
            ))}
            <button className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">Update Password</button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Two-Factor Authentication</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Add an extra layer of security to your account.</p>
            <button className="px-5 py-2 border border-primary-600 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20">Enable 2FA</button>
          </div>
        </motion.div>
      )}

      {activeTab === 'appearance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Theme & Display</h2>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">Color Theme</p>
              <div className="flex gap-3">
                {['Light', 'Dark', 'System'].map(t => (
                  <button key={t} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600">{t}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">Language</p>
              <select className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                <option>English</option>
                <option>العربية</option>
                <option>Français</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
