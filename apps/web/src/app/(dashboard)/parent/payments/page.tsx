'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { paymentsApi, subscriptionsApi } from '@/lib/api';

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  paid: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  pending: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  failed: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ParentPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      paymentsApi.getMyPayments().then(r => {
        const d = r.data?.data ?? r.data;
        setPayments(Array.isArray(d) ? d : []);
      }),
      subscriptionsApi.getMy().then(r => {
        setSubscription(r.data?.data ?? r.data);
      }),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments & Billing</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your subscription and view payment history</p>
      </div>

      {/* Subscription card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          {subscription ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary-200 text-sm">Current Plan</p>
                  <p className="text-2xl font-bold mt-1">{subscription.plan}</p>
                  <p className="text-primary-200 mt-1 text-sm capitalize">{subscription.status}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${ subscription.status === 'active' ? 'bg-green-400 text-green-900' : 'bg-amber-400 text-amber-900' }`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-primary-200 text-xs">Start date</p>
                  <p className="font-semibold">{formatDate(subscription.startsAt)}</p>
                </div>
                {subscription.endsAt && (
                  <div>
                    <p className="text-primary-200 text-xs">Renewal date</p>
                    <p className="font-semibold">{formatDate(subscription.endsAt)}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              <p className="text-primary-200 text-sm">Current Plan</p>
              <p className="text-2xl font-bold mt-1">Free</p>
              <p className="text-primary-200 mt-1 text-sm">No active subscription</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Payment method placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Payment Method</h2>
        <div className="flex items-center gap-4 p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <div className="h-10 w-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">No payment method on file — contact admin to add one</p>
        </div>
      </motion.div>

      {/* Payment history */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Payment History</h2>
        </div>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <CreditCard className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No payment records yet</p>
            <p className="text-xs mt-1">Payments will appear here once processed</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {payments.map((p) => {
              const status = (p.status ?? 'paid').toLowerCase();
              const cfg = statusConfig[status] ?? statusConfig.paid;
              const Icon = cfg.icon;
              return (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className={`h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {p.invoiceId ?? `Payment #${p.id.slice(-6).toUpperCase()}`}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(p.paidAt ?? p.createdAt)}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {p.currency ?? 'USD'} {typeof p.amount === 'number' ? p.amount.toFixed(2) : p.amount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
