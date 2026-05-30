'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { BookOpen, Star, Clock, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { usersApi } from '@/lib/api';

interface ChildProfile {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  gpa: string;
  sessionsAttended: number;
  enrolledCourses: number;
  courses: { name: string; grade: number; trend: 'up' | 'down' | 'stable' }[];
  gradeHistory: { week: string; grade: number }[];
}

function buildProfile(student: any): ChildProfile {
  const scores: number[] = (student.submissions ?? [])
    .filter((s: any) => s.score != null)
    .map((s: any) => s.score as number);

  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const gpa = scores.length > 0 ? (avg / 100 * 4).toFixed(1) : 'N/A';

  const gradeHistory = (student.submissions ?? [])
    .filter((s: any) => s.score != null)
    .slice(0, 6)
    .reverse()
    .map((s: any, i: number) => ({ week: `W${i + 1}`, grade: s.score as number }));

  const courseMap: Record<string, number[]> = {};
  for (const sub of student.submissions ?? []) {
    if (sub.score == null) continue;
    const title = sub.assignment?.course?.title ?? sub.assignment?.course?.category ?? 'Course';
    if (!courseMap[title]) courseMap[title] = [];
    courseMap[title].push(sub.score);
  }
  const courses = Object.entries(courseMap).slice(0, 4).map(([name, cs]) => {
    const courseAvg = Math.round(cs.reduce((a, b) => a + b, 0) / cs.length);
    const lastTwo = cs.slice(-2);
    const trend: 'up' | 'down' | 'stable' =
      lastTwo.length >= 2 ? (lastTwo[1] > lastTwo[0] ? 'up' : lastTwo[1] < lastTwo[0] ? 'down' : 'stable') : 'stable';
    return { name, grade: courseAvg, trend };
  });

  return {
    id: student.id,
    name: `${student.user?.firstName ?? ''} ${student.user?.lastName ?? ''}`.trim() || 'Student',
    grade: student.grade ?? '—',
    avatar: `${student.user?.firstName?.[0] ?? ''}${student.user?.lastName?.[0] ?? ''}`.toUpperCase() || '?',
    gpa,
    sessionsAttended: student.attendances?.length ?? 0,
    enrolledCourses: student._count?.enrollments ?? 0,
    courses,
    gradeHistory,
  };
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    usersApi.getMyChildren()
      .then((res) => {
        const list: any[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        const profiles = list.map(buildProfile);
        setChildren(profiles);
        if (profiles.length > 0) setSelectedId(profiles[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Children</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed view of each child&apos;s academic profile</p>
        </div>
        <div className="flex items-center justify-center py-20 text-center">
          <div>
            <p className="font-semibold text-slate-600 dark:text-slate-300">No children linked to your account</p>
            <p className="text-sm text-slate-400 mt-1">Contact your school administrator to link your children&apos;s accounts.</p>
          </div>
        </div>
      </div>
    );
  }

  const child = children.find((c) => c.id === selectedId) ?? children[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Children</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed view of each child&apos;s academic profile</p>
      </div>

      {/* Child selector */}
      <div className="flex gap-3 flex-wrap">
        {children.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
              selectedId === c.id
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
          { label: 'GPA', value: child.gpa, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Sessions Attended', value: String(child.sessionsAttended), icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Enrolled Courses', value: String(child.enrolledCourses), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Graded Work', value: String(child.gradeHistory.length), icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
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
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Recent Assignment Scores</h2>
          {child.gradeHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={child.gradeHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="grade" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              No graded submissions yet
            </div>
          )}
        </motion.div>

        {/* Course grades */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Course Performance</h2>
          {child.courses.length > 0 ? (
            <div className="space-y-4">
              {child.courses.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1 mr-2">{c.name}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
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
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              No graded course work yet
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
