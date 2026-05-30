'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, CheckCircle2, XCircle, Eye, Search, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { coursesApi } from '@/lib/api';

type Status = 'pending' | 'approved';

interface ContentItem {
  id: string;
  type: 'course';
  title: string;
  author: string;
  submittedAt: string;
  status: Status;
  category: string;
}

const TYPE_STYLE = 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400';

const STATUS_STYLES: Record<Status, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
};

function courseToItem(c: any): ContentItem {
  return {
    id: c.id,
    type: 'course',
    title: c.title ?? 'Untitled Course',
    author: c.teacher?.name ?? c.teacher?.email ?? 'Unknown',
    submittedAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—',
    status: c.isPublished ? 'approved' : 'pending',
    category: c.subject ?? c.category ?? 'General',
  };
}

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');

  useEffect(() => {
    coursesApi.getAll({ limit: 50 })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setItems(list.map(courseToItem));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function approve(id: string) {
    await coursesApi.update(id, { isPublished: true });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'approved' } : i));
  }

  async function unpublish(id: string) {
    await coursesApi.update(id, { isPublished: false });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'pending' } : i));
  }

  const filtered = items.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = items.filter((i) => i.status === 'pending').length;
  const approved = items.filter((i) => i.status === 'approved').length;

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review and publish courses from your teachers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Approval', value: loading ? '…' : pending, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
          { label: 'Published', value: loading ? '…' : approved, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Total Courses', value: loading ? '…' : items.length, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or author…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Unpublished</option>
          <option value="approved">Published</option>
        </select>
      </div>

      {/* Content list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {['Course', 'Teacher', 'Created', 'Status', 'Category', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                <AnimatePresence initial={false}>
                  {filtered.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${TYPE_STYLE}`}>course</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.author}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{item.submittedAt}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[item.status]}`}>
                          {item.status === 'approved' ? 'Published' : 'Unpublished'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{item.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.status === 'pending' ? (
                            <button
                              onClick={() => approve(item.id)}
                              className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors"
                              title="Publish"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => unpublish(item.id)}
                              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-colors"
                              title="Unpublish"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            href={`/admin/courses`}
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No courses match your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
