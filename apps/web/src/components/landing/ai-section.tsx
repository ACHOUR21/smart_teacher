'use client'

import { motion } from 'framer-motion'
import { Bot, Zap, Brain, FileText, Image, Mic, Globe, PenTool } from 'lucide-react'

const aiFeatures = [
  { icon: Bot, title: 'AI Tutor', desc: 'Personalized 1-on-1 tutoring that adapts to each student\'s pace and learning style.', color: 'text-blue-500' },
  { icon: FileText, title: 'Lesson Generator', desc: 'Generate full lesson plans, slides, and worksheets from a single prompt.', color: 'text-violet-500' },
  { icon: Brain, title: 'Mind Maps', desc: 'Auto-generate visual mind maps from any topic or uploaded document.', color: 'text-emerald-500' },
  { icon: PenTool, title: 'AI Grading', desc: 'Intelligent grading with detailed feedback and anti-plagiarism detection.', color: 'text-rose-500' },
  { icon: Mic, title: 'Voice AI', desc: 'Speech recognition, real-time subtitles, and voice commands in Arabic, French & English.', color: 'text-amber-500' },
  { icon: Globe, title: 'Live Translation', desc: 'Real-time voice and subtitle translation across 50+ languages.', color: 'text-cyan-500' },
  { icon: Image, title: 'AI Media', desc: 'Generate educational images, diagrams, and short explainer videos on demand.', color: 'text-pink-500' },
  { icon: Zap, title: 'Smart Recs', desc: 'AI-powered course and resource recommendations based on performance data.', color: 'text-indigo-500' },
]

export function AISection() {
  return (
    <section id="ai-tools" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-sm font-medium mb-6">
            <Bot className="w-3.5 h-3.5" />
            Powered by GPT-4, Gemini & Claude
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            AI tools for <span className="gradient-text">every moment</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            8 powerful AI systems integrated directly into your teaching and learning workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {aiFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700 card-hover"
            >
              <f.icon className={`w-8 h-8 ${f.color} mb-4`} />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
