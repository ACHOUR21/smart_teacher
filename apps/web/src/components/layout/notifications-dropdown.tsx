'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, CheckCheck, BookOpen, ClipboardList,
  Video, Info, AlertTriangle, Loader2
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { useNotifications } from '@/lib/use-notifications';

const TYPE_ICON: Record<string, React.ReactNode> = {
  COURSE: <BookOpen className="w-4 h-4 text-primary-600" />,
  ASSIGNMENT: <ClipboardList className="w-4 h-4 text-orange-500" />,
  LIVE_SESSION: <Video className="w-4 h-4 text-purple-500" />,
  GRADE: <CheckCheck className="w-4 h-4 text-green-500" />,
  ALERT: <AlertTriangle className="w-4 h-4 text-red-500" />,
  INFO: <Info className="w-4 h-4 text-blue-500" />,
};

function typeIcon(type: string) {
  return TYPE_ICON[type] ?? TYPE_ICON.INFO;
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, markRead, markAllRead, dismiss } = useNotifications();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No notifications</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                        !n.isRead ? 'bg-primary-50/40 dark:bg-primary-900/10' : ''
                      }`}
                      onClick={() => markRead(n.id)}
                    >
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {typeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                        className="text-gray-300 hover:text-gray-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
