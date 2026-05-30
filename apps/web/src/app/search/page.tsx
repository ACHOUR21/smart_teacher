'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Users, ClipboardList, Video,
  ChevronRight, Filter, X, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { coursesApi, usersApi, assignmentsApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'users', label: 'People', icon: Users },
  { key: 'assignments', label: 'Assignments', icon: ClipboardList },
];

interface SearchResult {
  id: string;
  type: 'course' | 'user' | 'assignment';
  title: string;
  subtitle?: string;
  meta?: string;
  href: string;
  avatar?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const [coursesRes, usersRes, assignRes] = await Promise.allSettled([
        coursesApi.getAll({ search: q, limit: 6 }),
        usersApi.getAll({ search: q, limit: 6 }),
        assignmentsApi.getAll({ search: q, limit: 6 }),
      ]);

      const mapped: SearchResult[] = [];

      if (coursesRes.status === 'fulfilled') {
        const courses = coursesRes.value.data?.data ?? [];
        courses.forEach((c: any) => mapped.push({
          id: c.id,
          type: 'course',
          title: c.title,
          subtitle: c.teacher ? `${c.teacher.user?.firstName} ${c.teacher.user?.lastName}` : 'Unknown Teacher',
          meta: `${c.enrolledCount ?? 0} students`,
          href: `/student/courses/${c.id}`,
        }));
      }

      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value.data?.data ?? [];
        users.forEach((u: any) => mapped.push({
          id: u.id,
          type: 'user',
          title: `${u.firstName} ${u.lastName}`,
          subtitle: u.role,
          meta: u.email,
          href: user?.role === 'ADMIN' ? `/admin/users/${u.id}` : '#',
        }));
      }

      if (assignRes.status === 'fulfilled') {
        const assigns = assignRes.value.data?.data ?? [];
        assigns.forEach((a: any) => mapped.push({
          id: a.id,
          type: 'assignment',
          title: a.title,
          subtitle: a.course?.title,
          meta: a.dueDate ? formatRelativeTime(a.dueDate) : 'No due date',
          href: `/${(user?.role ?? 'student').toLowerCase()}/assignments/${a.id}`,
        }));
      }

      setResults(mapped);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const t = setTimeout(() => {
      search(query);
      if (query) router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [query, search, router]);

  const filtered = activeTab === 'all'
    ? results
    : results.filter((r) => {
        if (activeTab === 'courses') return r.type === 'course';
        if (activeTab === 'users') return r.type === 'user';
        if (activeTab === 'assignments') return r.type === 'assignment';
        return true;
      });

  const typeIcon = (type: SearchResult['type']) => {
    if (type === 'course') return <BookOpen className="w-4 h-4 text-primary-600" />;
    if (type === 'user') return <Users className="w-4 h-4 text-accent-600" />;
    return <ClipboardList className="w-4 h-4 text-orange-500" />;
  };

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search</h1>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, people, assignments…"
            className="w-full pl-12 pr-10 py-3.5 text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({results.filter(r => {
                    if (tab.key === 'courses') return r.type === 'course';
                    if (tab.key === 'users') return r.type === 'user';
                    if (tab.key === 'assignments') return r.type === 'assignment';
                    return false;
                  }).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center py-16"
            >
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </motion.div>
          ) : !query ? (
            <motion.div key="empty-query" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16 text-gray-400"
            >
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Start typing to search the platform</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16 text-gray-400"
            >
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">No results for "{query}"</p>
              <p className="text-sm">Try a different search term</p>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filtered.map((result, i) => (
                <motion.div
                  key={result.id + result.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={result.href}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      {typeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{result.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {result.meta && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">{result.meta}</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
