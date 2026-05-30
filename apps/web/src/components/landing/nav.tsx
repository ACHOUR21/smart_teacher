'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">EduAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'AI Tools', 'Pricing', 'About'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Get started free
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4 space-y-3"
        >
          {['Features', 'AI Tools', 'Pricing', 'About'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="block text-sm font-medium text-slate-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-slate-200">
            <Link href="/login" className="text-center text-sm font-medium py-2 text-slate-600">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-center text-sm font-semibold bg-primary-600 text-white py-2.5 rounded-xl"
            >
              Get started free
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
