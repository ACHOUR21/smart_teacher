'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Flag, CheckCircle2, XCircle, Eye,
  AlertTriangle, Search, Filter, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

type Status = 'pending' | 'approved' | 'rejected';

interface ContentItem {
  id: string;
  type: 'course' | 'lesson' | 'assignment';
  title: string;
  author: string;
  submittedAt: string;
  status: Status;
  flags: number;
  category: string;
}

const MOCK_CONTENT: ContentItem[] = [
  { id: '1', type: 'course', title: 'Advanced Machine Learning', author: 'Dr. Sarah Johnson', submittedAt: '2 hours ago', status: 'pending', flags: 0, category: 'Computer Science' },
  { id: '2', type: 'lesson', title: 'Introduction to Neural Networks', author: 'Prof. Ahmed Al-Rashid', submittedAt: '5 hours ago', status: 'pending', flags: 1, category: 'Computer Science' },
  { id: '3', type: 'assignment', title: 'Calculus Problem Set 3', author: 'Dr. Maria Santos', submittedAt: '1 day ago', status: 'approved', flags: 0, category: 'Mathematics' },
  { id: '4', type: 'course', title: 'World History: Modern Era', author: 'Prof. James Wilson', submittedAt: '2 days ago', status: 'rejected', flags: 2, category: 'History' },
  { id: '5', type: 'lesson', title: 'Chemical Bonding Lab', author: 'Dr. Lisa Chen', submittedAt: '3 days ago', status: 'approved', flags: 0, category: 'Chemistry' },
  { id: '6', type: 'assignment', title: 'Literary Analysis Essay', author: 'Prof. Emma Davis', submittedAt: '4 days ago', status: 'pending', flags: 0, category: 'Literature' },
];

const STATUS_STYLES: Record<Status, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const TYPE_STYLES: Record<string, string> = {
  course: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
  lesson: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  assignment: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
};

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>(MOCK_CONTENT);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = items.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const approve = (id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'approved' } : i));
    toast.success('Content approved');
  };

  const reject = (id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'rejected' } : i));
    toast.error('Content rejected');
  };

  const pending = items.filter((i) => i.status === 'pending').length;
  const flagged = items.filter((i) => i.flags > 0).length;
  const approved = items.filter((i) => i.status === 'approved').length;

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review and approve submitted courses, lessons, and assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: pending, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
          { label: 'Flagged', value: flagged, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
          { label: 'Approved Today', value: approved, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
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
            placeholder="Search content or author…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Types</option>
          <option value="course">Courses</option>
          <option value="lesson">Lessons</option>
          <option value="assignment">Assignments</option>
        </select>
      </div>

      {/* Content list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {['Content', 'Author', 'Submitted', 'Status', 'Flags', 'Actions'].map((h) => (
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
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium capitalize ${TYPE_STYLES[item.type]}`}>
                            {item.type}
                          </span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.author}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{item.submittedAt}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.flags > 0 ? (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <Flag className="w-3 h-3" /> {item.flags}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approve(item.id)}
                              className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => reject(item.id)}
                              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
              <p>No content matches your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
