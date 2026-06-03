'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Search, UserPlus, CheckCircle2,
  Loader2, Mail, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api';

const searchSchema = z.object({
  query: z.string().min(3, 'Enter at least 3 characters'),
});

interface StudentResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  studentId?: string;
}

export default function AddChildPage() {
  const router = useRouter();
  const [step, setStep] = useState<'search' | 'confirm' | 'done'>('search');
  const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<StudentResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
  });

  const onSearch = async (data: { query: string }) => {
    setSearching(true);
    setSearched(false);
    try {
      const res = await usersApi.searchStudents(data.query, 10);
      setSearchResults(res.data ?? []);
    } catch {
      toast.error('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const handleSelect = (student: StudentResult) => {
    setSelected(student);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setLinking(true);
    try {
      await usersApi.linkChild(selected.id);
      setStep('done');
      toast.success(`${selected.firstName} has been linked to your account`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to link student';
      toast.error(msg);
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/parent/children" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Child</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Link a student account to your parent profile</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'search' && (
          <motion.div key="search" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Search for Student</h2>
              <form onSubmit={handleSubmit(onSearch)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student Name or Email
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('query')}
                      placeholder="e.g. Amir Hassan or amir@student.edu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {errors.query && (
                    <p className="mt-1 text-xs text-red-500">{errors.query.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>
              </form>
            </div>

            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </h3>
                <div className="space-y-3">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer"
                      onClick={() => handleSelect(student)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                        {student.grade && <p className="text-xs text-gray-400">{student.grade}</p>}
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-100">
                        <UserPlus className="w-3.5 h-3.5" /> Select
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {searched && searchResults.length === 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">No students found</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Ask your child's school administrator to confirm the name or email registered in the system.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'confirm' && selected && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Confirm Link</h2>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-lg font-bold">
                {selected.firstName[0]}{selected.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                  {selected.firstName} {selected.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {selected.email}
                </p>
                {selected.grade && <p className="text-sm text-gray-400">{selected.grade}</p>}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              By confirming, you'll be able to monitor this student's academic progress, grades, attendance, and receive notifications about their activity.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('search')}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={linking}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Confirm & Link
              </button>
            </div>
          </motion.div>
        )}

        {step === 'done' && selected && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {selected.firstName} Linked!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              You can now monitor {selected.firstName}'s academic progress from your dashboard.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/parent/children"
                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                View Children
              </Link>
              <button
                onClick={() => { setStep('search'); setSearchResults([]); setSelected(null); setSearched(false); }}
                className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Add Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
