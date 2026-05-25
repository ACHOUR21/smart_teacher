'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Math Teacher, London',
    avatar: 'SM',
    content: 'The AI lesson generator saves me 3+ hours every week. My students are more engaged than ever, and the live whiteboard is incredible.',
    rating: 5,
    color: 'from-blue-500 to-cyan-400',
  },
  {
    name: 'Youssef Amrani',
    role: 'Student, Casablanca',
    avatar: 'YA',
    content: 'The AI tutor explains concepts in Arabic and uses examples I actually understand. My grades went from C to A in one semester.',
    rating: 5,
    color: 'from-violet-500 to-purple-400',
  },
  {
    name: 'Marie Dupont',
    role: 'Parent, Paris',
    avatar: 'MD',
    content: "I can see my daughter's attendance and grades in real time. I get notified immediately if she misses a class. Total peace of mind.",
    rating: 5,
    color: 'from-rose-500 to-pink-400',
  },
  {
    name: 'Ahmed Al-Rashid',
    role: 'School Admin, Dubai',
    avatar: 'AR',
    content: 'Managing 3,000 students used to be a nightmare. EduAI makes it seamless — user management, reports, everything in one place.',
    rating: 5,
    color: 'from-amber-500 to-orange-400',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Loved by <span className="gradient-text">educators worldwide</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-7 shadow-card border border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
