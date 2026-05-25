'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { BookOpen, TrendingUp, TrendingDown, Minus, Download, Filter } from 'lucide-react';

const courses = [
  { id: 1, name: 'Advanced Mathematics', code: 'MATH401', students: 28, avg: 84.2, highest: 98, lowest: 61 },
  { id: 2, name: 'Physics Fundamentals', code: 'PHYS201', students: 24, avg: 76.8, highest: 95, lowest: 52 },
  { id: 3, name: 'Calculus II', code: 'MATH302', students: 31, avg: 79.4, highest: 97, lowest: 48 },
];

const distributions = [
  { grade: 'A (90-100)', count: 8, color: '#22c55e' },
  { grade: 'B (80-89)', count: 12, color: '#3b82f6' },
  { grade: 'C (70-79)', count: 9, color: '#f59e0b' },
  { grade: 'D (60-69)', count: 4, color: '#f97316' },
  { grade: 'F (<60)', count: 3, color: '#ef4444' },
];

const students = [
  { name: 'Sarah Johnson', grade: 94, trend: 'up', assignments: '12/12', participation: 'High' },
  { name: 'Ahmed Hassan', grade: 88, trend: 'up', assignments: '11/12', participation: 'High' },
  { name: 'Emma Wilson', grade: 82, trend: 'stable', assignments: '12/12', participation: 'Medium' },
  { name: 'James Chen', grade: 76, trend: 'down', assignments: '10/12', participation: 'Medium' },
  { name: 'Maria Garcia', grade: 71, trend: 'up', assignments: '11/12', participation: 'Low' },
  { name: 'Liam Brown', grade: 65, trend: 'down', assignments: '9/12', participation: 'Low' },
  { name: 'Sofia Martinez', grade: 58, trend: 'down', assignments: '8/12', participation: 'Low' },
];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
}

function gradeColor(g: number) {
  if (g >= 90) return 'text-green-600 dark:text-green-400';
  if (g >= 80) return 'text-blue-600 dark:text-blue-400';
  if (g >= 70) return 'text-amber-600 dark:text-amber-400';
  if (g >= 60) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export default function TeacherGradesPage() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0].id);
  const course = courses.find(c => c.id === selectedCourse)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grade Book</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and analyse student grades</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Course selector */}
      <div className="flex gap-3 flex-wrap">
        {courses.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCourse(c.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCourse === c.id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Class Average', value: `${course.avg}%`, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Highest Grade', value: `${course.highest}%`, color: 'text-green-600 dark:text-green-400' },
          { label: 'Lowest Grade', value: `${course.lowest}%`, color: 'text-red-600 dark:text-red-400' },
          { label: 'Total Students', value: course.students, color: 'text-primary-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Grade Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distributions} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="grade" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distributions.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Grade breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Grade Breakdown</h2>
          <div className="space-y-3">
            {distributions.map(d => (
              <div key={d.grade} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{d.grade}</span>
                <span className="text-sm font-semibold" style={{ color: d.color }}>{d.count} students</span>
                <div className="w-24 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${(d.count / course.students) * 100}%`, backgroundColor: d.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Student grade table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Student Grades</h2>
          <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50">
                {['Student', 'Grade', 'Letter', 'Trend', 'Assignments', 'Participation'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {students.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                        {s.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${gradeColor(s.grade)}`}>{s.grade}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${gradeColor(s.grade)}`}>
                      {s.grade >= 90 ? 'A' : s.grade >= 80 ? 'B' : s.grade >= 70 ? 'C' : s.grade >= 60 ? 'D' : 'F'}
                    </span>
                  </td>
                  <td className="px-6 py-4"><TrendIcon trend={s.trend} /></td>
                  <td className="px-6 py-4"><span className="text-sm text-slate-600 dark:text-slate-300">{s.assignments}</span></td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      s.participation === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      s.participation === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>{s.participation}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
