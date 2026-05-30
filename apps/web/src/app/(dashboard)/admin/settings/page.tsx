'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Mail, Shield, Palette, Bell, Save, ToggleLeft } from 'lucide-react';

const tabs = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600' }`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${ checked ? 'translate-x-6' : 'translate-x-1' }`} />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [flags, setFlags] = useState({
    registration: true,
    aiEnabled: true,
    twoFactor: false,
    maintenanceMode: false,
    guestAccess: false,
    emailVerification: true,
  });

  const inputCls = 'w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500';

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure global platform behaviour</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${ tab === t.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300' }`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Platform Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Platform Name">
                <input defaultValue="EduAI Platform" className={inputCls} />
              </Field>
              <Field label="Support Email">
                <input defaultValue="support@eduai.platform" className={inputCls} />
              </Field>
              <Field label="Default Language">
                <select className={inputCls}><option>English</option><option>العربية</option><option>Français</option></select>
              </Field>
              <Field label="Timezone">
                <select className={inputCls}><option>UTC+3 (Riyadh)</option><option>UTC+0 (London)</option><option>UTC-5 (New York)</option></select>
              </Field>
            </div>
            <div className="space-y-4 pt-2">
              {[
                ['registration', 'Open Registration', 'Allow new users to sign up'],
                ['aiEnabled', 'AI Features', 'Enable AI tutor and content generation'],
                ['guestAccess', 'Guest Access', 'Allow preview without an account'],
              ].map(([key, title, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <Toggle checked={flags[key as keyof typeof flags]} onChange={v => setFlags(p => ({ ...p, [key]: v }))} />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={save} className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">
                <Save className="h-4 w-4" />{saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'email' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">SMTP Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="SMTP Host"><input defaultValue="smtp.sendgrid.net" className={inputCls} /></Field>
              <Field label="SMTP Port"><input defaultValue="587" type="number" className={inputCls} /></Field>
              <Field label="Username"><input defaultValue="apikey" className={inputCls} /></Field>
              <Field label="Password"><input type="password" defaultValue="SG.placeholder" className={inputCls} /></Field>
              <Field label="From Address"><input defaultValue="noreply@eduai.platform" className={inputCls} /></Field>
              <Field label="From Name"><input defaultValue="EduAI Platform" className={inputCls} /></Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="px-5 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50">Send Test Email</button>
              <button onClick={save} className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">
                <Save className="h-4 w-4" />{saved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Security Policies</h2>
            {[
              ['twoFactor', 'Require 2FA for Admins', 'Force all admins to use two-factor authentication'],
              ['emailVerification', 'Email Verification', 'Require email verification before platform access'],
              ['maintenanceMode', 'Maintenance Mode', 'Block all logins except admin accounts'],
            ].map(([key, title, desc]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <Toggle checked={flags[key as keyof typeof flags]} onChange={v => setFlags(p => ({ ...p, [key]: v }))} />
              </div>
            ))}
            <div className="pt-2">
              <Field label="Session Timeout (minutes)">
                <input type="number" defaultValue={60} className={`${inputCls} max-w-xs`} />
              </Field>
            </div>
            <div className="flex justify-end">
              <button onClick={save} className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">
                <Save className="h-4 w-4" />{saved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'appearance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Branding</h2>
            <Field label="Platform Name (shown in UI)">
              <input defaultValue="EduAI" className={inputCls} />
            </Field>
            <Field label="Primary Color">
              <div className="flex items-center gap-3">
                <input type="color" defaultValue="#3b82f6" className="h-9 w-16 rounded-lg border border-slate-200 cursor-pointer" />
                <span className="text-sm text-slate-500">#3b82f6</span>
              </div>
            </Field>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">Default Theme</p>
              <div className="flex gap-3">{['Light', 'Dark', 'System'].map(t => <button key={t} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:border-primary-500">{t}</button>)}</div>
            </div>
            <div className="flex justify-end">
              <button onClick={save} className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">
                <Save className="h-4 w-4" />{saved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'notifications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">System Notifications</h2>
            {[
              ['New user registration email', 'Send welcome email to new users'],
              ['Assignment submission alerts', 'Notify teachers of new submissions'],
              ['Payment confirmation', 'Send receipt on successful payments'],
              ['Security alert emails', 'Email admins on suspicious activity'],
              ['Weekly summary report', 'Send weekly platform summary to admins'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <Toggle checked={true} onChange={() => {}} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
