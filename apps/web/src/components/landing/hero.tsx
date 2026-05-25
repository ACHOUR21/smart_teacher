'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play, Sparkles, Users, BookOpen, Award } from 'lucide-react'

const floatingCards = [
  { icon: Users, label: '50K+ Students', color: 'from-blue-500 to-cyan-400', delay: 0 },
  { icon: BookOpen, label: '2,400 Courses', color: 'from-violet-500 to-purple-400', delay: 0.2 },
  { icon: Award, label: '98% Pass Rate', color: 'from-emerald-500 to-green-400', delay: 0.4 },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary-200/40 dark:bg-primary-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-accent-200/40 dark:bg-accent-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-100/30 dark:bg-primary-950/20 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230c84e8' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by GPT-4, Gemini & Claude
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 text-balance">
            The Future of
            <br />
            <span className="gradient-text">AI-Powered Learning</span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 text-balance leading-relaxed">
            An enterprise-grade educational platform combining AI tutors, live classes,
            adaptive learning, and immersive AR/VR experiences — built for teachers, students,
            parents, and administrators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Start learning for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center gap-2.5 px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center">
                <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
              </div>
              Watch demo
            </button>
          </div>
        </motion.div>

        {/* Floating stat cards */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {floatingCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + card.delay }}
              className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-4.5 h-4.5 text-white" size={18} />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{card.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 relative"
        >
          <div className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs mx-auto text-center">
                  app.eduai.com/student
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-primary-50 dark:from-slate-900 dark:to-primary-950/30 p-8 min-h-[400px] flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                {[['Active Courses', '8', 'from-blue-400 to-cyan-400'], ['Assignments', '3 Due', 'from-violet-400 to-purple-400'], ['AI Sessions', '24', 'from-emerald-400 to-green-400']].map(([label, val, grad]) => (
                  <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card text-center">
                    <div className={`text-2xl font-bold bg-gradient-to-r ${grad} bg-clip-text text-transparent mb-1`}>{val}</div>
                    <div className="text-xs text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Glow */}
          <div className="absolute -inset-4 bg-primary-400/10 dark:bg-primary-600/10 rounded-3xl blur-2xl -z-10" />
        </motion.div>
      </div>
    </section>
  )
}
