'use client'

import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { TrendingUp, Award, Zap, Target, Flame, Star } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'

const weeklyActivity = [
  { day: 'Mon', minutes: 45, lessons: 2 },
  { day: 'Tue', minutes: 90, lessons: 4 },
  { day: 'Wed', minutes: 30, lessons: 1 },
  { day: 'Thu', minutes: 120, lessons: 5 },
  { day: 'Fri', minutes: 60, lessons: 3 },
  { day: 'Sat', minutes: 75, lessons: 3 },
  { day: 'Sun', minutes: 15, lessons: 1 },
]

const gradeHistory = [
  { month: 'Jan', grade: 74 },
  { month: 'Feb', grade: 78 },
  { month: 'Mar', grade: 75 },
  { month: 'Apr', grade: 82 },
  { month: 'May', grade: 87 },
]

const subjectProgress = [
  { subject: 'Mathematics', progress: 72, grade: 89, color: '#3b82f6' },
  { subject: 'Physics', progress: 55, grade: 82, color: '#8b5cf6' },
  { subject: 'English', progress: 88, grade: 94, color: '#f43f5e' },
  { subject: 'History', progress: 30, grade: 76, color: '#f59e0b' },
  { subject: 'Chemistry', progress: 45, grade: 80, color: '#10b981' },
  { subject: 'Biology', progress: 60, grade: 85, color: '#14b8a6' },
]

const badges = [
  { name: 'Fast Learner', icon: Zap, desc: 'Completed 5 lessons in one day', earned: true, color: 'from-amber-400 to-orange-400' },
  { name: 'Top Scorer', icon: Star, desc: 'Scored 90%+ on 3 consecutive quizzes', earned: true, color: 'from-violet-400 to-purple-500' },
  { name: 'Streak Master', icon: Flame, desc: '14-day learning streak', earned: true, color: 'from-red-400 to-rose-500' },
  { name: 'Perfect Score', icon: Target, desc: 'Score 100% on any assignment', earned: false, color: 'from-slate-300 to-slate-400' },
]

export default function StudentProgressPage() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="My Progress" subtitle="Track your learning journey" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard title="Overall Grade" value="87%" icon={Award} gradient="from-emerald-500 to-green-400" trend={{ value: 5, label: 'vs last month' }} />
          <StatsCard title="Learning Streak" value="14 days" icon={Flame} gradient="from-red-500 to-rose-400" />
          <StatsCard title="XP Points" value="3,240" icon={Zap} gradient="from-amber-500 to-orange-400" trend={{ value: 18, label: 'this week' }} />
          <StatsCard title="Courses Done" value="2/8" icon={Target} gradient="from-violet-500 to-purple-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly activity */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Weekly Study Time (minutes)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyActivity} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#cbd5e1' }}
                  itemStyle={{ color: '#7c3aed' }}
                />
                <Bar dataKey="minutes" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade trend */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Grade Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={gradeHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: any) => [`${v}%`, 'Grade']}
                />
                <Line type="monotone" dataKey="grade" stroke="#0c84e8" strokeWidth={3} dot={{ fill: '#0c84e8', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Subject Progress</h2>
          <div className="space-y-4">
            {subjectProgress.map((s) => (
              <div key={s.subject} className="flex items-center gap-4">
                <span className="text-sm text-slate-600 dark:text-slate-400 w-28 flex-shrink-0">{s.subject}</span>
                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.progress}%`, background: s.color }} />
                </div>
                <span className="text-xs font-semibold text-slate-500 w-10 text-right">{s.progress}%</span>
                <span className="text-xs font-bold w-12 text-right" style={{ color: s.color }}>{s.grade}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map((b) => (
              <div key={b.name} className={`text-center p-5 rounded-2xl border ${ b.earned ? 'border-transparent bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700' : 'border-slate-200 dark:border-slate-700 opacity-50'}`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                  <b.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</p>
                <p className="text-xs text-slate-400 mt-1 leading-tight">{b.desc}</p>
                {b.earned && <span className="inline-block mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">Earned</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
