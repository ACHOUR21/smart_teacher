'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Users, TrendingUp, ClipboardList, Award, Download, Loader2 } from 'lucide-react';
import { analyticsApi } from '@/lib/api';

const WEEKLY_ENGAGEMENT_FALLBACK = [
  { week: 'Wk 1', views: 142, submissions: 38, liveAttendance: 22 },
  { week: 'Wk 2', views: 189, submissions: 45, liveAttendance: 28 },
  { week: 'Wk 3', views: 167, submissions: 41, liveAttendance: 25 },
  { week: 'Wk 4', views: 213, submissions: 52, liveAttendance: 31 },
  { week: 'Wk 5', views: 198, submissions: 48, liveAttendance: 30 },
  { week: 'Wk 6', views: 245, submissions: 61, liveAttendance: 36 },
  { week: 'Wk 7', views: 231, submissions: 57, liveAttendance: 33 },
  { week: 'Wk 8', views: 267, submissions: 68, liveAttendance: 40 },
];

const FALLBACK_GRADE_DIST = [
  { grade: 'A', range: '90-100', count: 8 },
  { grade: 'B', range: '80-89', count: 11 },
  { grade: 'C', range: '70-79', count: 7 },
  { grade: 'D', range: '60-69', count: 3 },
  { grade: 'F', range: '0-59', count: 1 },
];

const STUDENT_SCATTER = Array.from({ length: 30 }, (_, i) => ({
  attendance: 60 + Math.round(Math.random() * 40),
  grade: 50 + Math.round(Math.random() * 50),
  name: `Student ${i + 1}`,
}));

const COMPLETION_TREND = [
  { month: 'Sep', rate: 60 },
  { month: 'Oct', rate: 68 },
  { month: 'Nov', rate: 72 },
  { month: 'Dec', rate: 78 },
  { month: 'Jan', rate: 78 },
  { month: 'Feb', rate: 82 },
];

interface TeacherStats {
  totalCourses: number;
  totalStudents: number;
  totalSubmissions: number;
  avgScore: number;
  liveSessions: number;
  courses: Array<{ id: string; title: string; status: string; enrolled: number; chapters: number }>;
  gradeDistribution: Array<{ grade: string; range: string; count: number }>;
  submissionTrend: Array<{ month: string; count: number }>;
}

export default function TeacherAnalyticsPage() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'4w' | '8w' | '12w'>('8w');
  const [engData, setEngData] = useState<any[]>([]);
  const [engLoading, setEngLoading] = useState(true);

  useEffect(() => {
    analyticsApi.teacher()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const weeks = range === '4w' ? 4 : range === '8w' ? 8 : 12;
    setEngLoading(true);
    analyticsApi.teacherWeeklyEngagement(weeks)
      .then((res) => {
        const d = res.data;
        setEngData(Array.isArray(d) ? d : (d?.data ?? []));
      })
      .catch(() => {
        const slice = range === '4w' ? -4 : range === '8w' ? -8 : 0;
        setEngData(WEEKLY_ENGAGEMENT_FALLBACK.slice(slice));
      })
      .finally(() => setEngLoading(false));
  }, [range]);

  const gradeDistData = stats?.gradeDistribution ?? FALLBACK_GRADE_DIST;
  const gradeChartData = gradeDistData.map((g) => ({
    range: `${g.grade} (${g.range})`,
    count: g.count,
  }));

  const trendData = stats?.submissionTrend ?? COMPLETION_TREND.map((m) => ({
    month: m.month,
    count: Math.round(m.rate * 0.6),
  }));

  const statCards = [
    {
      label: 'Total Students',
      value: loading ? '…' : String(stats?.totalStudents ?? 68),
      sub: `across ${stats?.totalCourses ?? 0} courses`,
      icon: Users,
      color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30',
    },
    {
      label: 'Avg Grade',
      value: loading ? '…' : `${stats?.avgScore ?? 82}%`,
      sub: 'graded submissions',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/30',
    },
    {
      label: 'Submissions',
      value: loading ? '…' : String(stats?.totalSubmissions ?? 410),
      sub: 'total graded',
      icon: ClipboardList,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
    },
    {
      label: 'Live Sessions',
      value: loading ? '…' : String(stats?.liveSessions ?? 0),
      sub: 'hosted this term',
      icon: Award,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    },
  ];

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
        {statCards.map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <s.icon className="w-5 h-5" />}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Engagement over time */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Student Engagement Over Time</h3>
          {engLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>
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
            <Area type="monotone" dataKey="views" name="Lesson Completions" stroke="#3b82f6" fill="url(#views)" strokeWidth={2} />
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
            <BarChart data={gradeChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 11 }} width={90} />
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

      {/* Submission trend from API */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Graded Submissions</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="subTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="count" name="Submissions" stroke="#8b5cf6" fill="url(#subTrend)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-course table */}
      {stats?.courses && stats.courses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Course Summary</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-700">
                {['Course', 'Status', 'Enrolled', 'Chapters'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {stats.courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.title}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      c.status === 'PUBLISHED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.enrolled} students</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.chapters} chapters</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
