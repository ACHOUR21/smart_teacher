'use client';

import { motion } from 'framer-motion';
import { Award, Download, Share2, CheckCircle2, Lock, Star } from 'lucide-react';

const CERTIFICATES = [
  {
    id: '1',
    title: 'Advanced Mathematics',
    issuer: 'Dr. Sarah Johnson',
    issuedAt: 'January 15, 2025',
    grade: 'A',
    score: 94,
    earned: true,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: '2',
    title: 'Computer Science 101',
    issuer: 'Prof. Ahmed Al-Rashid',
    issuedAt: 'February 2, 2025',
    grade: 'A+',
    score: 98,
    earned: true,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: '3',
    title: 'Physics Fundamentals',
    issuer: 'Dr. Maria Santos',
    issuedAt: null,
    grade: null,
    score: null,
    earned: false,
    color: 'from-purple-500 to-violet-600',
  },
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
  const earned = BADGES.filter((b) => b.earned).length;

  return (
    <div className="flex-1 p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates & Achievements</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your earned certificates and badges</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Certificates Earned', value: CERTIFICATES.filter((c) => c.earned).length, icon: Award, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
          { label: 'Badges Unlocked', value: `${earned}/${BADGES.length}`, icon: Star, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30' },
          { label: 'Top Grade', value: 'A+', icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {CERTIFICATES.map((cert, i) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl overflow-hidden ${
                cert.earned ? 'opacity-100' : 'opacity-60'
              }`}
            >
              {/* Card */}
              <div className={`bg-gradient-to-br ${cert.color} p-6 text-white`}>
                <div className="flex items-start justify-between mb-4">
                  <Award className="w-8 h-8 opacity-90" />
                  {cert.earned
                    ? <span className="text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">Issued {cert.issuedAt}</span>
                    : <Lock className="w-5 h-5 opacity-70" />
                  }
                </div>
                <h3 className="font-bold text-lg leading-tight">{cert.title}</h3>
                <p className="text-sm opacity-80 mt-0.5">{cert.issuer}</p>
                {cert.score !== null && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-3xl font-black">{cert.grade}</span>
                    <span className="text-lg opacity-80">· {cert.score}%</span>
                  </div>
                )}
                {!cert.earned && (
                  <p className="mt-4 text-sm opacity-80">Complete this course to earn</p>
                )}
              </div>

              {/* Actions */}
              {cert.earned && (
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
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievement Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGES.map((badge, i) => (
            <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border text-center transition-all ${
                badge.earned
                  ? 'border-yellow-200 dark:border-yellow-800 shadow-sm'
                  : 'border-gray-100 dark:border-gray-700 opacity-50'
              }`}
            >
              <div className={`text-4xl mb-2 ${ badge.earned ? '' : 'grayscale opacity-40' }`}>
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
