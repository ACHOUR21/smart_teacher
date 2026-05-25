'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { User, Bell, Shield, Globe, Moon, Sun, Save, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const tabs = ['Profile', 'Notifications', 'Privacy', 'Appearance'] as const
type Tab = typeof tabs[number]

export default function StudentSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Profile')
  const [form, setForm] = useState({ name: 'Alex Johnson', email: 'alex@school.edu', phone: '+1 234 567 8900', bio: '', language: 'English', timezone: 'UTC-5' })
  const [notifs, setNotifs] = useState({ grades: true, assignments: true, messages: true, liveSessions: true, announcements: false, weeklyReport: true })

  const save = () => toast.success('Settings saved successfully!')

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Settings" />
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 w-fit">
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', activeTab === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                {t}
              </button>
            ))}
          </div>

          {activeTab === 'Profile' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
                <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Personal Information</h2>
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">AJ</div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{form.name}</p>
                    <p className="text-sm text-slate-500">Student</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[['Full Name', 'name'], ['Email', 'email'], ['Phone', 'phone']].map(([label, key]) => (
                    <div key={key} className={key === 'email' ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
                      <input
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
                    <textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} placeholder="Tell us a bit about yourself..." rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                  </div>
                </div>
              </div>
              <button onClick={save} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold text-sm rounded-xl hover:bg-primary-700 transition-colors">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {Object.entries(notifs).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    </div>
                    <button
                      onClick={() => setNotifs({ ...notifs, [key]: !val })}
                      className={cn('w-11 h-6 rounded-full transition-colors', val ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600')}
                    >
                      <div className={cn('w-4 h-4 rounded-full bg-white shadow transition-transform mx-1', val ? 'translate-x-5' : 'translate-x-0')} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={save} className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold text-sm rounded-xl hover:bg-primary-700 transition-colors">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          )}

          {(activeTab === 'Privacy' || activeTab === 'Appearance') && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
              <p className="text-slate-500 text-sm">{activeTab} settings coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
