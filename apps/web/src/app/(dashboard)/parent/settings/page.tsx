'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Bell, Shield, Palette, Save, Camera } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600' }`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${ checked ? 'translate-x-6' : 'translate-x-1' }`} />
    </button>
  );
}

export default function ParentSettingsPage() {
  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ gradeUpdate: true, teacherMessage: true, attendance: true, payment: true, newsletter: false });

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: 'Fatima', lastName: 'Hassan', email: 'fatima.hassan@email.com', phone: '+966 50 123 4567' },
  });

  function onSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${ tab === t.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300' }`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">FH</div>
                <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md"><Camera className="h-3.5 w-3.5" /></button>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Fatima Hassan</p>
                <p className="text-sm text-slate-500">Parent · 2 children enrolled</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([['firstName', 'First Name'], ['lastName', 'Last Name'], ['email', 'Email'], ['phone', 'Phone']] as const).map(([f, l]) => (
                  <div key={f}>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{l}</label>
                    <input {...register(f)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
                    {errors[f] && <p className="text-xs text-red-500 mt-1">{errors[f]?.message}</p>}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">
                  <Save className="h-4 w-4" />{saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {tab === 'notifications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
            {([
              ['gradeUpdate', 'Grade updates', 'When a new grade is posted for any child'],
              ['teacherMessage', 'Teacher messages', 'When a teacher sends you a message'],
              ['attendance', 'Attendance alerts', "When a child is marked absent or late"],
              ['payment', 'Payment reminders', 'Upcoming billing and payment confirmations'],
              ['newsletter', 'School newsletter', 'Monthly school news and announcements'],
            ] as const).map(([key, title, desc]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <Toggle checked={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</h2>
            {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
              <div key={l}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{l}</label>
                <input type="password" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
            ))}
            <button className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">Update Password</button>
          </div>
        </motion.div>
      )}

      {tab === 'appearance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">Theme</p>
              <div className="flex gap-3">{['Light', 'Dark', 'System'].map(t => <button key={t} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:border-primary-500">{t}</button>)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">Language</p>
              <select className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                <option>English</option><option>العربية</option><option>Français</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
