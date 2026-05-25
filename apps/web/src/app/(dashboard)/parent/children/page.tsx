'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { BookOpen, Star, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const children = [
  {
    id: 1, name: 'Layla Hassan', grade: '9th Grade', avatar: 'LH',
    gpa: 3.8, attendance: 96, streak: 14, rank: 4,
    courses: [
      { name: 'Advanced Math', grade: 94, trend: 'up' },
      { name: 'Physics', grade: 88, trend: 'stable' },
      { name: 'English Lit', grade: 91, trend: 'up' },
      { name: 'History', grade: 85, trend: 'down' },
    ],
    gradeHistory: [
      { week: 'W1', grade: 82 }, { week: 'W2', grade: 85 }, { week: 'W3', grade: 88 },
      { week: 'W4', grade: 86 }, { week: 'W5', grade: 91 }, { week: 'W6', grade: 94 },
    ],
  },
  {
    id: 2, name: 'Omar Hassan', grade: '7th Grade', avatar: 'OH',
    gpa: 3.4, attendance: 91, streak: 7, rank: 12,
    courses: [
      { name: 'Mathematics', grade: 80, trend: 'up' },
      { name: 'Science', grade: 76, trend: 'down' },
      { name: 'Arabic', grade: 88, trend: 'up' },
      { name: 'PE', grade: 95, trend: 'stable' },
    ],
    gradeHistory: [
      { week: 'W1', grade: 75 }, { week: 'W2', grade: 77 }, { week: 'W3', grade: 76 },
      { week: 'W4', grade: 80 }, { week: 'W5', grade: 79 }, { week: 'W6', grade: 82 },
    ],
  },
];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
}

export default function ParentChildrenPage() {
  const [selected, setSelected] = useState(children[0].id);
  const child = children.find(c => c.id === selected)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Children</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed view of each child\'s academic profile</p>
      </div>

      {/* Child selector */}
      <div className="flex gap-3">
        {children.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
              selected === c.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300'
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {c.avatar}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</p>
              <p className="text-xs text-slate-500">{c.grade}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'GPA', value: child.gpa.toFixed(1), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Attendance', value: `${child.attendance}%`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Study Streak', value: `${child.streak}d`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Class Rank', value: `#${child.rank}`, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Grade Trend (6 Weeks)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={child.gradeHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[60, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="grade" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Course grades */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Courses</h2>
          <div className="space-y-4">
            {child.courses.map(c => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{c.name}</span>
                  <div className="flex items-center gap-1.5">
                    <TrendIcon trend={c.trend} />
                    <span className={`text-sm font-bold ${
                      c.grade >= 90 ? 'text-green-600 dark:text-green-400' :
                      c.grade >= 80 ? 'text-blue-600 dark:text-blue-400' :
                      c.grade >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600'
                    }`}>{c.grade}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-400"
                    style={{ width: `${c.grade}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
