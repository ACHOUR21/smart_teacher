'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, TrendingDown, Award, BookOpen,
  ClipboardList, Calendar, Mail, MessageCircle, AlertTriangle,
  CheckCircle2, Clock, BarChart2, Target
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart,
  RadialBar, Legend
} from 'recharts';
import Link from 'next/link';

const GRADE_TREND = [
  { week: 'W1', grade: 72 }, { week: 'W2', grade: 75 },
  { week: 'W3', grade: 68 }, { week: 'W4', grade: 80 },
  { week: 'W5', grade: 77 }, { week: 'W6', grade: 85 },
  { week: 'W7', grade: 82 }, { week: 'W8', grade: 88 },
];

const ASSIGNMENT_PERF = [
  { name: 'Quiz 1', score: 85, avg: 78 },
  { name: 'HW 1', score: 92, avg: 80 },
  { name: 'Midterm', score: 74, avg: 72 },
  { name: 'Quiz 2', score: 88, avg: 75 },
  { name: 'HW 2', score: 95, avg: 82 },
  { name: 'Final', score: 82, avg: 79 },
];

const RADIAL_DATA = [
  { name: 'Assignments', value: 88, fill: '#3b82f6' },
  { name: 'Attendance', value: 92, fill: '#22c55e' },
  { name: 'Participation', value: 75, fill: '#f59e0b' },
  { name: 'Quiz Avg', value: 86, fill: '#8b5cf6' },
];

const RECENT_SUBMISSIONS = [
  { id: '1', title: 'Quiz 2 - Chapter 4', status: 'graded', score: 88, submittedAt: '2 days ago' },
  { id: '2', title: 'Homework 2', status: 'graded', score: 95, submittedAt: '5 days ago' },
  { id: '3', title: 'Midterm Exam', status: 'graded', score: 74, submittedAt: '2 weeks ago' },
  { id: '4', title: 'Final Project', status: 'pending', score: null, submittedAt: 'Due in 3 days' },
];

const ATTENDANCE_LOG = [
  { date: 'Mon, Jan 20', status: 'present', session: 'Chapter 4 Intro' },
  { date: 'Wed, Jan 22', status: 'present', session: 'Chapter 4 Deep Dive' },
  { date: 'Mon, Jan 27', status: 'absent', session: 'Chapter 5 Intro' },
  { date: 'Wed, Jan 29', status: 'present', session: 'Chapter 5 Workshop' },
  { date: 'Mon, Feb 3', status: 'late', session: 'Chapter 6 Intro' },
  { date: 'Wed, Feb 5', status: 'present', session: 'Chapter 6 Lab' },
];

const MOCK_STUDENT = {
  id: '1',
  firstName: 'Amir',
  lastName: 'Hassan',
  email: 'amir.hassan@student.edu',
  avatar: null,
  grade: 88,
  trend: 6,
  attendance: 92,
  streak: 14,
  rank: 3,
  enrolledCourses: 3,
  completedAssignments: 18,
  totalAssignments: 20,
  joinedAt: 'September 2024',
  atRisk: false,
};

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function TeacherStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const student = MOCK_STUDENT;

  return (
    <div className="flex-1 p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{student.email}</p>
          </div>
          {student.atRisk && (
            <span className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
              <AlertTriangle className="w-4 h-4" /> At Risk
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <a
            href={`mailto:${student.email}`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Mail className="w-4 h-4" /> Email
          </a>
          <Link
            href="/teacher/messages"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Message
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart2}
          label="Current Grade"
          value={`${student.grade}%`}
          sub={student.trend >= 0 ? `+${student.trend}% this month` : `${student.trend}% this month`}
          color={`bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400`}
        />
        <StatCard
          icon={Calendar}
          label="Attendance Rate"
          value={`${student.attendance}%`}
          sub="This semester"
          color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={ClipboardList}
          label="Assignments"
          value={`${student.completedAssignments}/${student.totalAssignments}`}
          sub="Completed"
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        />
        <StatCard
          icon={Award}
          label="Class Rank"
          value={`#${student.rank}`}
          sub={`Streak: ${student.streak} days`}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Grade Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={GRADE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="grade"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radial performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={RADIAL_DATA}>
              <RadialBar dataKey="value" cornerRadius={4} />
              <Legend iconSize={10} layout="vertical" verticalAlign="bottom" />
              <Tooltip formatter={(v) => `${v}%`} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assignment performance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Assignment Performance vs. Class Average</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ASSIGNMENT_PERF}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" name="Student" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avg" name="Class Avg" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Submissions + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Submissions</h3>
          <div className="space-y-3">
            {RECENT_SUBMISSIONS.map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  sub.status === 'graded'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-500'
                }`}>
                  {sub.status === 'graded' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{sub.title}</p>
                  <p className="text-xs text-gray-400">{sub.submittedAt}</p>
                </div>
                {sub.score !== null && (
                  <span className={`text-sm font-bold ${
                    sub.score >= 90 ? 'text-green-600' : sub.score >= 75 ? 'text-blue-600' : 'text-orange-600'
                  }`}>{sub.score}%</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Attendance log */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Log</h3>
          <div className="space-y-3">
            {ATTENDANCE_LOG.map((entry, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  entry.status === 'present' ? 'bg-green-500' :
                  entry.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.session}</p>
                  <p className="text-xs text-gray-400">{entry.date}</p>
                </div>
                <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                  entry.status === 'present'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : entry.status === 'absent'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
