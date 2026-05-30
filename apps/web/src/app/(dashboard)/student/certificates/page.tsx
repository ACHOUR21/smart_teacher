'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, CheckCircle2, Lock, Star } from 'lucide-react';
import { coursesApi } from '@/lib/api';

const CARD_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-green-500 to-emerald-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-teal-500 to-cyan-600',
];

const BADGES = [
  { id: '1', name: 'First A Grade', icon: '🎯', earned: true, desc: 'Score 90%+ on any assignment', earnedAt: 'Oct 2024' },
  { id: '2', name: '7-Day Streak', icon: '🔥', earned: true, desc: 'Log in 7 days in a row', earnedAt: 'Nov 2024' },
  { id: '3', name: 'Perfect Score', icon: '💯', earned: true, desc: 'Score 100% on any quiz', earnedAt: 'Dec 2024' },
  { id: '4', name: 'Top of Class', icon: '🏆', earned: true, desc: 'Rank #1 in any course', earnedAt: 'Jan 2025' },
  { id: '5', name: '30-Day Streak', icon: '⚡', earned: false, desc: 'Log in 30 days in a row', earnedAt: null },
  { id: '6', name: 'Course Master', icon: '🎓', earned: false, desc: 'Complete 5 courses', earnedAt: null },
  { id: '7', name: 'Night Owl', icon: '🦉', earned: false, desc: 'Study after 10 PM for 5 days', earnedAt: null },
  { id: '8', name: 'Speed Learner', icon: '🚀', earned: false, desc: 'Complete a course in under 2 weeks', earnedAt: null },
];

export default function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const earnedBadges = BADGES.filter((b) => b.earned).length;

  useEffect(() => {
    coursesApi
      .getMyCertificates()
      .then((r) => {
        const data = r.data?.data ?? r.data;
        setCerts(Array.isArray(data) ? data : []);
      })
      .catch(() => setCerts([]))
      .finally(() => setLoading(false));
  }, []);

  const earnedCerts = certs.filter((c) => c.isCompleted);
  const topScore = earnedCerts.length > 0 ? Math.max(...earnedCerts.map((c) => c.percentage)) : null;

  return (
    <div className="flex-1 p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates & Achievements</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your earned certificates and badges</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Certificates Earned', value: loading ? '—' : earnedCerts.length, icon: Award, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
          { label: 'Badges Unlocked', value: `${earnedBadges}/${BADGES.length}`, icon: Star, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30' },
          { label: 'Best Completion', value: loading ? '—' : topScore !== null ? `${topScore}%` : 'N/A', icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Certificates */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certificates</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-44" />
            ))}
          </div>
        ) : certs.length === 0 ? (
          <div className="text-center py-14 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Enroll in courses to start earning certificates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {certs.map((cert, i) => (
              <motion.div
                key={cert.courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl overflow-hidden ${cert.isCompleted ? 'opacity-100' : 'opacity-70'}`}
              >
                <div className={`bg-gradient-to-br ${CARD_COLORS[i % CARD_COLORS.length]} p-6 text-white`}>
                  <div className="flex items-start justify-between mb-4">
                    <Award className="w-8 h-8 opacity-90" />
                    {cert.isCompleted ? (
                      <span className="text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">100% Complete</span>
                    ) : (
                      <Lock className="w-5 h-5 opacity-70" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{cert.courseTitle}</h3>
                  <p className="text-sm opacity-80 mt-0.5">{cert.teacherName}</p>
                  {cert.isCompleted ? (
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-3xl font-black">A</span>
                      <span className="text-lg opacity-80">· {cert.percentage}%</span>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1 opacity-80">
                        <span>{cert.completedLessons}/{cert.totalLessons} lessons</span>
                        <span>{cert.percentage}%</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-1.5">
                        <div
                          className="bg-white rounded-full h-1.5"
                          style={{ width: `${cert.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs opacity-70 mt-2">Complete all lessons to earn</p>
                    </div>
                  )}
                </div>
                {cert.isCompleted && (
                  <div className="bg-white dark:bg-gray-800 px-5 py-3 flex items-center gap-3">
                    <button className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline font-medium">
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                    <span className="text-gray-200 dark:text-gray-700">|</span>
                    <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 font-medium">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievement Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGES.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border text-center transition-all ${
                badge.earned
                  ? 'border-yellow-200 dark:border-yellow-800 shadow-sm'
                  : 'border-gray-100 dark:border-gray-700 opacity-50'
              }`}
            >
              <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale opacity-40'}`}>
                {badge.earned ? badge.icon : '🔒'}
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{badge.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{badge.desc}</p>
              {badge.earned && badge.earnedAt && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-2">{badge.earnedAt}</p>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
