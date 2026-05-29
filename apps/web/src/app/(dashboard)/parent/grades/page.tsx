'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { usersApi } from '@/lib/api';

interface SubjectGrade {
  name: string;
  grade: number;
  letter: string;
  trend: 'up' | 'down' | 'stable';
  count: string;
}

interface ChildData {
  name: string;
  grade: string;
  gpa: string;
  subjects: SubjectGrade[];
}

function letterGrade(g: number): string {
  if (g >= 93) return 'A';
  if (g >= 90) return 'A-';
  if (g >= 87) return 'B+';
  if (g >= 83) return 'B';
  if (g >= 80) return 'B-';
  if (g >= 77) return 'C+';
  if (g >= 73) return 'C';
  if (g >= 70) return 'C-';
  return 'D';
}

function letterBg(letter: string) {
  if (letter.startsWith('A')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (letter.startsWith('B')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (letter.startsWith('C')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

function buildChildData(student: any): ChildData {
  const submissions = student.submissions ?? [];
  const courseMap: Record<string, number[]> = {};

  for (const sub of submissions) {
    if (sub.score == null) continue;
    const title = sub.assignment?.course?.title ?? sub.assignment?.course?.category ?? 'Course';
    if (!courseMap[title]) courseMap[title] = [];
    courseMap[title].push(sub.score);
  }

  const subjects: SubjectGrade[] = Object.entries(courseMap).map(([name, scores]) => {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const lastTwo = scores.slice(-2);
    const trend: 'up' | 'down' | 'stable' =
      lastTwo.length >= 2 ? (lastTwo[1] > lastTwo[0] ? 'up' : lastTwo[1] < lastTwo[0] ? 'down' : 'stable') : 'stable';
    return {
      name,
      grade: avg,
      letter: letterGrade(avg),
      trend,
      count: `${scores.length} graded`,
    };
  });

  const allScores = submissions.filter((s: any) => s.score != null).map((s: any) => s.score as number);
  const avgAll = allScores.length > 0 ? allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length : 0;
  const gpa = allScores.length > 0 ? (avgAll / 100 * 4).toFixed(1) : 'N/A';

  return {
    name: `${student.user?.firstName ?? ''} ${student.user?.lastName ?? ''}`.trim() || 'Student',
    grade: student.grade ?? '—',
    gpa,
    subjects,
  };
}

function TrendIcon({ t }: { t: string }) {
  if (t === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (t === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
}

export default function ParentGradesPage() {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getMyChildren()
      .then((res) => {
        const list: any[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setChildren(list.map(buildChildData));
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grades</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Academic performance for all children</p>
      </div>

      {children.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-center">
          <div>
            <p className="font-semibold text-slate-600 dark:text-slate-300">No children linked to your account</p>
            <p className="text-sm text-slate-400 mt-1">Contact your school administrator to link your children&apos;s accounts.</p>
          </div>
        </div>
      ) : (
        children.map((child, ci) => (
          <motion.div
            key={child.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                {child.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{child.name}</p>
                <p className="text-sm text-slate-500">{child.grade} · GPA {child.gpa}</p>
              </div>
            </div>

            {child.subjects.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 text-sm">
                No graded assignments yet
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      {['Subject', 'Grade', 'Letter', 'Trend', 'Assignments'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {child.subjects.map((s) => (
                      <tr key={s.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">{s.name}</td>
                        <td className="px-5 py-3 text-sm font-bold text-slate-900 dark:text-white">{s.grade}%</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${letterBg(s.letter)}`}>{s.letter}</span>
                        </td>
                        <td className="px-5 py-3"><TrendIcon t={s.trend} /></td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{s.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}
