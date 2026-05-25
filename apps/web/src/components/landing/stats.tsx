'use client'

import { motion } from 'framer-motion'

const stats = [
  { value: '50K+', label: 'Active Students' },
  { value: '2,400+', label: 'Courses Available' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '120+', label: 'Countries' },
]

export function StatsSection() {
  return (
    <section className="py-16 border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
