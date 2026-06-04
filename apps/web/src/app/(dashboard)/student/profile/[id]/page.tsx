'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, BookOpen, Calendar, MessageCircle, Loader2, UserX
} from 'lucide-react';
import Link from 'next/link';
import { usersApi } from '@/lib/api';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  avatarUrl?: string;
  student?: {
    id: string;
    grade?: string;
    _count: { enrollments: number; submissions: number };
    enrollments: Array<{
      course: { id: string; title: string };
    }>;
  };
}

export default function StudentProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    usersApi.getOne(id)
      .then((res) => setProfile(res.data))
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <UserX className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Profile not found</h2>
        <p className="text-gray-400 text-sm mb-6">This student profile doesn't exist or has been removed.</p>
        <Link href="/student/courses" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
          Browse Courses
        </Link>
      </div>
    );
  }

  const joinedYear = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const enrollments = profile.student?.enrollments ?? [];
  const enrollmentCount = profile.student?._count.enrollments ?? 0;
  const submissionCount = profile.student?._count.submissions ?? 0;

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Profile header */}
        <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl p-8 text-white">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold flex-shrink-0">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
              <p className="text-primary-100 mt-1">
                {profile.student?.grade ? `${profile.student.grade} · ` : ''}Joined {joinedYear}
              </p>
            </div>
            <Link
              href="/student/messages"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Message
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
            {[
              { label: 'Courses', value: enrollmentCount, icon: BookOpen },
              { label: 'Submissions', value: submissionCount, icon: Award },
              { label: 'Joined', value: new Date(profile.createdAt).getFullYear(), icon: Calendar },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-primary-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active courses */}
        {enrollments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-600" /> Enrolled Courses
            </h2>
            <div className="space-y-3">
              {enrollments.map(({ course }) => (
                <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-primary-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</p>
                </div>
              ))}
              {enrollmentCount > enrollments.length && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  +{enrollmentCount - enrollments.length} more courses
                </p>
              )}
            </div>
          </div>
        )}

        {enrollments.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center py-10">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Not enrolled in any courses yet</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
