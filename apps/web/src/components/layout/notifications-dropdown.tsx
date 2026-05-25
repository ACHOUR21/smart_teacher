'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, BookOpen, MessageSquare, AlertCircle, TrendingUp, X } from 'lucide-react';

const mockNotifications = [
  {
    id: '1', type: 'ASSIGNMENT', title: 'New Assignment Posted',
    body: 'Mr. Al-Rashid posted "Derivatives Practice Set" due May 28.',
    isRead: false, time: '5 min ago',
  },
  {
    id: '2', type: 'MESSAGE', title: 'New Message',
    body: 'Ms. Carter sent you a message about the lab session.',
    isRead: false, time: '20 min ago',
  },
  {
    id: '3', type: 'GRADE', title: 'Grade Posted',
    body: 'Your assignment "Limits Quiz" has been graded: 92/100.',
    isRead: false, time: '1 hour ago',
  },
  {
    id: '4', type: 'LIVE', title: 'Live Session Starting',
    body: 'Advanced Mathematics live class starts in 15 minutes.',
    isRead: true, time: '2 hours ago',
  },
  {
    id: '5', type: 'SYSTEM', title: 'Welcome to EduAI!',
    body: 'Your account is set up and ready to go.',
    isRead: true, time: '2 days ago',
  },
];

const iconMap: Record<string, { Icon: typeof Bell; cls: string; bg: string }> = {
  ASSIGNMENT: { Icon: BookOpen, cls: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  MESSAGE: { Icon: MessageSquare, cls: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  GRADE: { Icon: TrendingUp, cls: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  LIVE: { Icon: AlertCircle, cls: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  SYSTEM: { Icon: Bell, cls: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-700' },
};

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function markAllRead() {
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));
  }

  function markRead(id: string) {
    setNotifications(p => p.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  function dismiss(id: string) {
    setNotifications(p => p.filter(n => n.id !== id));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Notifications {unreadCount > 0 && <span className="ml-1.5 text-xs font-bold text-primary-600">({unreadCount})</span>}
              </p>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No notifications
                </div>
              ) : (
                notifications.map(n => {
                  const { Icon, cls, bg } = iconMap[n.type] ?? iconMap.SYSTEM;
                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40 ${
                        !n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`h-4 w-4 ${cls}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-snug ${
                            !n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                          }`}>{n.title}</p>
                          <button
                            onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                            className="flex-shrink-0 text-slate-300 hover:text-slate-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.body}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                      {!n.isRead && <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary-500 mt-2" />}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 text-center">
              <button className="text-xs text-primary-600 font-medium hover:text-primary-700">View all notifications</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
