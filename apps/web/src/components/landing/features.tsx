'use client'

import { motion } from 'framer-motion'
import {
  GraduationCap, Users, Heart, Shield,
  Sparkles, Video, ClipboardList, BarChart3,
  Bot, BookOpen, Bell, Settings
} from 'lucide-react'

const roles = [
  {
    role: 'Teachers',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-100 dark:border-blue-900/40',
    features: [
      { icon: Sparkles, text: 'AI lesson & quiz generator' },
      { icon: Video, text: 'Live classes with whiteboard' },
      { icon: ClipboardList, text: 'Smart assignment grading' },
      { icon: BarChart3, text: 'Deep student analytics' },
    ],
  },
  {
    role: 'Students',
    icon: BookOpen,
    color: 'from-violet-500 to-purple-400',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-100 dark:border-violet-900/40',
    features: [
      { icon: Bot, text: 'Personalized AI tutor' },
      { icon: Video, text: 'Join live classes anywhere' },
      { icon: BarChart3, text: 'Progress tracking & XP' },
      { icon: BookOpen, text: 'Download & study offline' },
    ],
  },
  {
    role: 'Parents',
    icon: Heart,
    color: 'from-rose-500 to-pink-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-100 dark:border-rose-900/40',
    features: [
      { icon: BarChart3, text: 'Real-time grade monitoring' },
      { icon: Bell, text: 'Instant attendance alerts' },
      { icon: Users, text: 'Direct teacher messaging' },
      { icon: ClipboardList, text: 'Assignment overview' },
    ],
  },
  {
    role: 'Admins',
    icon: Shield,
    color: 'from-amber-500 to-orange-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-100 dark:border-amber-900/40',
    features: [
      { icon: Users, text: 'Full user management' },
      { icon: Settings, text: 'Platform configuration' },
      { icon: BarChart3, text: 'Institutional analytics' },
      { icon: Shield, text: 'Security & audit logs' },
    ],
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Built for <span className="gradient-text">every role</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Four fully tailored dashboards — each designed with the specific needs of teachers,
            students, parents, and administrators in mind.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role, i) => (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`${role.bg} ${role.border} border rounded-3xl p-8 card-hover`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg`}>
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{role.role}</h3>
              </div>
              <ul className="space-y-3">
                {role.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                      <f.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{f.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
