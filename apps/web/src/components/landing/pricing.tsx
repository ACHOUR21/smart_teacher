'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    desc: 'Perfect for individual students',
    features: ['5 courses', '5GB storage', 'AI tutor (10 sessions/mo)', 'Basic analytics', 'Email support'],
    cta: 'Get started free',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    desc: 'For serious teachers & students',
    features: ['Unlimited courses', '100GB storage', 'Unlimited AI sessions', 'Live classes', 'Advanced analytics', 'Priority support', 'AR/VR experiences'],
    cta: 'Start 14-day trial',
    href: '/register?plan=pro',
    highlighted: true,
  },
  {
    name: 'Institution',
    price: 199,
    period: 'month',
    desc: 'For schools and universities',
    features: ['Everything in Pro', 'Unlimited users', '1TB storage', 'Custom branding', 'SSO/SAML', 'SLA 99.9%', 'Dedicated support', 'Custom integrations'],
    cta: 'Contact sales',
    href: '/contact',
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Start free. Scale as you grow. No hidden fees.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-primary-600 to-primary-700 text-white shadow-2xl scale-105'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-500 text-slate-900 text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-primary-200' : 'text-slate-500'}`}>{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className={`text-sm ${plan.highlighted ? 'text-primary-200' : 'text-slate-500'}`}>/{plan.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-accent-400' : 'text-primary-500'}`} />
                    <span className={plan.highlighted ? 'text-primary-100' : 'text-slate-600 dark:text-slate-300'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-white text-primary-700 hover:bg-primary-50'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
