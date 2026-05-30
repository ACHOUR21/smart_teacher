'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Award, BookOpen, Calendar, Star, TrendingUp,
  MessageCircle, UserCheck
} from 'lucide-react';
import Link from 'next/link';

const MOCK_PROFILE = {
  id: '1',
  firstName: 'Amir',
  lastName: 'Hassan',
  bio: 'Passionate about mathematics and computer science. Always looking to learn something new.',
  grade: '10th Grade',
  joinedAt: 'September 2024',
  gpa: 3.8,
  coursesEnrolled: 5,
  assignmentsCompleted: 42,
  streak: 21,
  badges: [
    { id: 1, name: 'Top Performer', icon: '🏆', color: 'from-yellow-400 to-orange-400' },
    { id: 2, name: 'Quick Learner', icon: '⚡', color: 'from-blue-400 to-cyan-400' },
    { id: 3, name: 'Consistent', icon: '🔥', color: 'from-red-400 to-pink-400' },
    { id: 4, name: 'Helper', icon: '🤝', color: 'from-green-400 to-emerald-400' },
  ],
  courses: [
    { id: 'c1', title: 'Advanced Mathematics', progress: 78, teacher: 'Dr. Sarah Johnson' },
    { id: 'c2', title: 'Computer Science 101', progress: 92, teacher: 'Prof. Ahmed Al-Rashid' },
    { id: 'c3', title: 'Physics Fundamentals', progress: 65, teacher: 'Dr. Maria Santos' },
  ],
};

export default function StudentProfilePage() {
  const params = useParams();
  const profile = MOCK_PROFILE;

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Profile header */}
        <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl p-8 text-white">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
              <p className="text-primary-100 mt-1">{profile.grade} · Joined {profile.joinedAt}</p>
              <p className="mt-3 text-primary-100 max-w-lg text-sm">{profile.bio}</p>
            </div>
            <Link
              href="/student/messages"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Message
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            {[
              { label: 'GPA', value: profile.gpa, icon: TrendingUp },
              { label: 'Courses', value: profile.coursesEnrolled, icon: BookOpen },
              { label: 'Assignments', value: profile.assignmentsCompleted, icon: UserCheck },
              { label: 'Day Streak', value: profile.streak, icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-primary-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-600" /> Achievements
          </h2>
          <div className="flex flex-wrap gap-3">
            {profile.badges.map((badge) => (
              <div key={badge.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${badge.color} text-white text-sm font-medium shadow-sm`}>
                <span>{badge.icon}</span>
                {badge.name}
              </div>
            ))}
          </div>
        </div>

        {/* Active courses */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-600" /> Active Courses
          </h2>
          <div className="space-y-4">
            {profile.courses.map((course) => (
              <div key={course.id}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</p>
                  <span className="text-sm text-gray-500">{course.progress}%</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{course.teacher}</p>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
