'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, BookOpen, Users, ClipboardList, Loader2 } from 'lucide-react';
import { searchApi } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'courses' | 'users' | 'assignments';

interface SearchResults {
  courses: any[];
  users: any[];
  assignments: any[];
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  const runSearch = useCallback(async (q: string, tab: Tab) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const type = tab === 'all' ? undefined : tab;
      const { data } = await searchApi.search(q, type);
      setResults(data);
      // Sync URL
      router.replace(`/search?q=${encodeURIComponent(q)}${tab !== 'all' ? `&type=${tab}` : ''}`, { scroll: false });
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { runSearch(debouncedQuery, activeTab); }, [debouncedQuery, activeTab, runSearch]);

  const totalResults = results
    ? (results.courses.length + results.users.length + results.assignments.length)
    : 0;

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'all', label: 'All', icon: Search, count: totalResults },
    { id: 'courses', label: 'Courses', icon: BookOpen, count: results?.courses.length ?? 0 },
    { id: 'users', label: 'People', icon: Users, count: results?.users.length ?? 0 },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, count: results?.assignments.length ?? 0 },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, people, assignments…"
          className="w-full pl-12 pr-4 py-3.5 text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center',
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-md">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {!results && !loading && debouncedQuery.length < 2 && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Type at least 2 characters to search</p>
        </div>
      )}

      {results && totalResults === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium text-gray-700 dark:text-gray-300">No results for “{debouncedQuery}”</p>
          <p className="text-sm mt-1">Try different keywords or check the spelling</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Courses */}
          {(activeTab === 'all' || activeTab === 'courses') && results.courses.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Courses</h2>
              <div className="space-y-2">
                {results.courses.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/student/courses/${c.id}`}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{c.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {c.teacher?.user ? `${c.teacher.user.firstName} ${c.teacher.user.lastName}` : 'Unknown teacher'}
                          {c.category && ` · ${c.category}`}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {c._count?.enrollments ?? 0} enrolled
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* People */}
          {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">People</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.users.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-500 capitalize">{u.role.toLowerCase()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Assignments */}
          {(activeTab === 'all' || activeTab === 'assignments') && results.assignments.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Assignments</h2>
              <div className="space-y-2">
                {results.assignments.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/student/assignments/${a.id}`}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{a.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{a.course?.title ?? 'General'}</p>
                      </div>
                      {a.dueDate && (
                        <div className="text-xs text-gray-400 flex-shrink-0">
                          Due {new Date(a.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
