'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, BookOpen, Users, Star, Filter, MoreVertical } from 'lucide-react';

const courses = [
  { id: 1, title: 'Advanced Mathematics', teacher: 'Mr. Al-Rashid', students: 28, rating: 4.8, status: 'active', category: 'STEM', created: 'Jan 12, 2026' },
  { id: 2, title: 'Physics Fundamentals', teacher: 'Ms. Carter', students: 24, rating: 4.6, status: 'active', category: 'STEM', created: 'Feb 3, 2026' },
  { id: 3, title: 'World Literature', teacher: 'Mrs. Davis', students: 31, rating: 4.9, status: 'active', category: 'Humanities', created: 'Jan 20, 2026' },
  { id: 4, title: 'Digital Art & Design', teacher: 'Mr. Park', students: 18, rating: 4.7, status: 'active', category: 'Arts', created: 'Mar 1, 2026' },
  { id: 5, title: 'Arabic Language', teacher: 'Ms. Khalil', students: 22, rating: 4.5, status: 'active', category: 'Languages', created: 'Jan 15, 2026' },
  { id: 6, title: 'Introduction to Chemistry', teacher: 'Dr. Patel', students: 0, rating: 0, status: 'draft', category: 'STEM', created: 'May 10, 2026' },
  { id: 7, title: 'History of the Middle East', teacher: 'Dr. Lee', students: 19, rating: 4.4, status: 'active', category: 'Humanities', created: 'Feb 18, 2026' },
  { id: 8, title: 'Physical Education', teacher: 'Coach Rivera', students: 35, rating: 4.3, status: 'archived', category: 'PE', created: 'Sep 1, 2025' },
];

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  archived: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

const categories = ['All', 'STEM', 'Humanities', 'Arts', 'Languages', 'PE'];

export default function AdminCoursesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = courses.filter(c => {
    const matchQ = c.title.toLowerCase().includes(query.toLowerCase()) || c.teacher.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    return matchQ && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Courses</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all courses on the platform</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus className="h-4 w-4" /> New Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: courses.length },
          { label: 'Active', value: courses.filter(c => c.status === 'active').length },
          { label: 'Draft', value: courses.filter(c => c.status === 'draft').length },
          { label: 'Total Enrollments', value: courses.reduce((s, c) => s + c.students, 0) },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search courses or teachers…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                category === c ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50">
                {['Course', 'Teacher', 'Students', 'Rating', 'Category', 'Status', 'Created', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{c.teacher}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                      <Users className="h-3.5 w-3.5" />{c.students}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {c.rating > 0 ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-slate-700 dark:text-slate-300">{c.rating}</span>
                      </div>
                    ) : <span className="text-slate-400 text-sm">—</span>}
                  </td>
                  <td className="px-5 py-4"><span className="text-sm text-slate-600 dark:text-slate-300">{c.category}</span></td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusStyles[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">{c.created}</td>
                  <td className="px-5 py-4">
                    <button className="p-1 text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
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
