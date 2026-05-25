'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const children = [
  {
    name: 'Layla Hassan', grade: '9th Grade', gpa: 3.8,
    subjects: [
      { name: 'Advanced Math', teacher: 'Mr. Al-Rashid', grade: 94, letter: 'A', trend: 'up', assignments: '12/12' },
      { name: 'Physics', teacher: 'Ms. Carter', grade: 88, letter: 'B+', trend: 'stable', assignments: '11/12' },
      { name: 'English Literature', teacher: 'Mrs. Davis', grade: 91, letter: 'A-', trend: 'up', assignments: '12/12' },
      { name: 'World History', teacher: 'Dr. Lee', grade: 85, letter: 'B', trend: 'down', assignments: '11/12' },
    ],
  },
  {
    name: 'Omar Hassan', grade: '7th Grade', gpa: 3.4,
    subjects: [
      { name: 'Mathematics', teacher: 'Ms. Thompson', grade: 80, letter: 'B-', trend: 'up', assignments: '10/11' },
      { name: 'Science', teacher: 'Mr. Patel', grade: 76, letter: 'C+', trend: 'down', assignments: '9/11' },
      { name: 'Arabic Language', teacher: 'Ms. Khalil', grade: 88, letter: 'B+', trend: 'up', assignments: '11/11' },
      { name: 'Physical Education', teacher: 'Coach Rivera', grade: 95, letter: 'A', trend: 'stable', assignments: '11/11' },
    ],
  },
];

function TrendIcon({ t }: { t: string }) {
  if (t === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (t === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
}

function letterBg(letter: string) {
  if (letter.startsWith('A')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (letter.startsWith('B')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (letter.startsWith('C')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

export default function ParentGradesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grades</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Academic performance for all children</p>
      </div>

      {children.map((child, ci) => (
        <motion.div
          key={child.name}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {child.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{child.name}</p>
              <p className="text-sm text-slate-500">{child.grade} · GPA {child.gpa.toFixed(1)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50">
                  {['Subject', 'Teacher', 'Grade', 'Letter', 'Trend', 'Assignments'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {child.subjects.map(s => (
                  <tr key={s.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">{s.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">{s.teacher}</td>
                    <td className="px-5 py-3 text-sm font-bold text-slate-900 dark:text-white">{s.grade}%</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${letterBg(s.letter)}`}>{s.letter}</span>
                    </td>
                    <td className="px-5 py-3"><TrendIcon t={s.trend} /></td>
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{s.assignments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
