'use client';

import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, AlertCircle, Clock, Download, Plus } from 'lucide-react';

const subscription = {
  plan: 'Pro Family',
  price: '$49/month',
  nextBilling: 'June 25, 2026',
  status: 'Active',
  children: 2,
};

const invoices = [
  { id: 'INV-2026-005', date: 'May 1, 2026', amount: '$49.00', status: 'paid', description: 'Pro Family Plan – May 2026' },
  { id: 'INV-2026-004', date: 'Apr 1, 2026', amount: '$49.00', status: 'paid', description: 'Pro Family Plan – April 2026' },
  { id: 'INV-2026-003', date: 'Mar 1, 2026', amount: '$49.00', status: 'paid', description: 'Pro Family Plan – March 2026' },
  { id: 'INV-2026-002', date: 'Feb 1, 2026', amount: '$49.00', status: 'paid', description: 'Pro Family Plan – February 2026' },
  { id: 'INV-2026-001', date: 'Jan 1, 2026', amount: '$49.00', status: 'paid', description: 'Pro Family Plan – January 2026' },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  paid: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  pending: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  failed: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
};

export default function ParentPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments & Billing</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your subscription and view invoices</p>
        </div>
      </div>

      {/* Subscription card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-200 text-sm">Current Plan</p>
              <p className="text-2xl font-bold mt-1">{subscription.plan}</p>
              <p className="text-primary-200 mt-1">{subscription.price} · {subscription.children} children</p>
            </div>
            <span className="bg-green-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full">{subscription.status}</span>
          </div>
          <div className="mt-6 flex items-center gap-6">
            <div>
              <p className="text-primary-200 text-xs">Next billing date</p>
              <p className="font-semibold">{subscription.nextBilling}</p>
            </div>
            <button className="ml-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
              Manage Plan
            </button>
          </div>
        </div>
      </motion.div>

      {/* Payment method */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Payment Method</h2>
          <button className="flex items-center gap-1.5 text-sm text-primary-600 font-medium">
            <Plus className="h-4 w-4" /> Add new
          </button>
        </div>
        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
          <div className="h-10 w-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Visa ending in 4242</p>
            <p className="text-xs text-slate-500">Expires 12/2028</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Default</span>
        </div>
      </motion.div>

      {/* Invoice history */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Invoice History</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {invoices.map((inv, i) => {
            const cfg = statusConfig[inv.status];
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className={`h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{inv.description}</p>
                  <p className="text-xs text-slate-500">{inv.date} · {inv.id}</p>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{inv.amount}</span>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
