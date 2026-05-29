'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Users, TrendingUp, ClipboardList, Award, Download } from 'lucide-react';

const WEEKLY_ENGAGEMENT = [
  { week: 'Wk 1', views: 142, submissions: 38, liveAttendance: 22 },
  { week: 'Wk 2', views: 189, submissions: 45, liveAttendance: 28 },
  { week: 'Wk 3', views: 167, submissions: 41, liveAttendance: 25 },
  { week: 'Wk 4', views: 213, submissions: 52, liveAttendance: 31 },
  { week: 'Wk 5', views: 198, submissions: 48, liveAttendance: 30 },
  { week: 'Wk 6', views: 245, submissions: 61, liveAttendance: 36 },
  { week: 'Wk 7', views: 231, submissions: 57, liveAttendance: 33 },
  { week: 'Wk 8', views: 267, submissions: 68, liveAttendance: 40 },
];

const GRADE_DIST = [
  { range: 'A (90-100)', count: 8, pct: 27 },
  { range: 'B (80-89)', count: 11, pct: 37 },
  { range: 'C (70-79)', count: 7, pct: 23 },
  { range: 'D (60-69)', count: 3, pct: 10 },
  { range: 'F (<60)', count: 1, pct: 3 },
];

const COURSE_PERF = [
  { course: 'Adv. Math', avgGrade: 82, completionRate: 78, enrolled: 28 },
  { course: 'CS 101', avgGrade: 88, completionRate: 91, enrolled: 22 },
  { course: 'Physics', avgGrade: 75, completionRate: 65, enrolled: 18 },
];

const STUDENT_SCATTER = Array.from({ length: 30 }, (_, i) => ({
  attendance: 60 + Math.round(Math.random() * 40),
  grade: 50 + Math.round(Math.random() * 50),
  name: `Student ${i + 1}`,
}));

const COMPLETION_TREND = [
  { month: 'Sep', math: 60, cs: 75, physics: 50 },
  { month: 'Oct', math: 68, cs: 80, physics: 58 },
  { month: 'Nov', math: 72, cs: 85, physics: 63 },
  { month: 'Dec', math: 78, cs: 88, physics: 65 },
  { month: 'Jan', math: 78, cs: 91, physics: 65 },
];

const STAT_CARDS = [
  { label: 'Total Students', value: '68', sub: '+5 this month', icon: Users, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
  { label: 'Avg Grade', value: '82%', sub: '+3% vs last month', icon: TrendingUp, color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
  { label: 'Submissions', value: '410', sub: '94% on time', icon: ClipboardList, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' },
  { label: 'Top Performers', value: '19', sub: 'Grade A students', icon: Award, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' },
];

export default function TeacherAnalyticsPage() {
  const [range, setRange] = useState<'4w' | '8w' | '12w'>('8w');

  const engData = range === '4w' ? WEEKLY_ENGAGEMENT.slice(-4) :
    range === '8w' ? WEEKLY_ENGAGEMENT : [...WEEKLY_ENGAGEMENT, ...WEEKLY_ENGAGEMENT.slice(0, 4)];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Performance insights across all your courses</p>
        </div>
        <div className="flex items-center gap-2">
          {(['4w', '8w', '12w'] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                range === r ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
              }`}>{r}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Engagement over time */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Student Engagement Over Time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={engData}>
            <defs>
              <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="subs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="views" name="Lesson Views" stroke="#3b82f6" fill="url(#views)" strokeWidth={2} />
            <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#22c55e" fill="url(#subs)" strokeWidth={2} />
            <Area type="monotone" dataKey="liveAttendance" name="Live Attendance" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 2-col row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={GRADE_DIST} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[0, 15]} tick={{ fontSize: 12 }} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v) => [`${v} students`]} />
              <Bar dataKey="count" name="Students" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance vs grade scatter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Attendance vs Grade</h3>
          <p className="text-xs text-gray-400 mb-4">Correlation between attendance rate and final grade</p>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="attendance" name="Attendance" unit="%" tick={{ fontSize: 11 }} label={{ value: 'Attendance %', position: 'insideBottom', offset: -2, fontSize: 11 }} />
              <YAxis dataKey="grade" name="Grade" unit="%" tick={{ fontSize: 11 }} />
              <ZAxis range={[40, 40]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, n) => [`${v}%`, n]} />
              <Scatter data={STUDENT_SCATTER} fill="#3b82f6" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course completion trend */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Course Completion Rate Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={COMPLETION_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[40, 100]} unit="%" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v}%`]} />
            <Legend />
            <Line type="monotone" dataKey="math" name="Adv. Math" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="cs" name="CS 101" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="physics" name="Physics" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Per-course table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Course Performance Summary</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-700">
              {['Course', 'Enrolled', 'Avg Grade', 'Completion', 'Status'].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {COURSE_PERF.map((c) => (
              <tr key={c.course} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.course}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.enrolled} students</td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-semibold ${
                    c.avgGrade >= 85 ? 'text-green-600' : c.avgGrade >= 75 ? 'text-blue-600' : 'text-orange-600'
                  }`}>{c.avgGrade}%</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${c.completionRate}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{c.completionRate}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    c.completionRate >= 85 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    c.completionRate >= 70 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  }`}>{c.completionRate >= 85 ? 'On Track' : c.completionRate >= 70 ? 'Good' : 'Needs Attention'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
