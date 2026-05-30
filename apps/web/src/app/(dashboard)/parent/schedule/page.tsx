'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Video, CalendarDays } from 'lucide-react';
import { usersApi } from '@/lib/api';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const STATUS_COLORS: Record<string, string> = {
  LIVE: 'bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-500',
  SCHEDULED: 'bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500',
};

const CHILD_COLORS = [
  'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
];

const today = new Date();

export default function ParentSchedulePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(
    WEEKDAYS[today.getDay() === 0 || today.getDay() === 6 ? 0 : today.getDay() - 1],
  );

  useEffect(() => {
    usersApi
      .getChildrenSchedule()
      .then((r) => {
        const data = r.data?.data ?? r.data;
        setSessions(Array.isArray(data) ? data : []);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  // Group sessions by weekday abbreviation
  const grouped: Record<string, any[]> = {};
  for (const session of sessions) {
    if (!session.scheduledAt) continue;
    const dayName = DAY_NAMES[new Date(session.scheduledAt).getDay()];
    if (dayName === 'Sun' || dayName === 'Sat') continue;
    if (!grouped[dayName]) grouped[dayName] = [];
    grouped[dayName].push(session);
  }

  // Stable color per child name
  const childNames = [...new Set(sessions.map((s) => s.childName))];
  const childColorMap: Record<string, string> = {};
  childNames.forEach((name, i) => {
    childColorMap[name as string] = CHILD_COLORS[i % CHILD_COLORS.length];
  });

  const dayEvents = grouped[activeDay] ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Class Schedule</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Upcoming live sessions for your children</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2">
        {WEEKDAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all relative ${
              activeDay === day
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
            }`}
          >
            {day}
            {(grouped[day]?.length ?? 0) > 0 && (
              <span
                className={`absolute top-1 right-1.5 w-2 h-2 rounded-full ${
                  activeDay === day ? 'bg-white/60' : 'bg-primary-500'
                }`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Events */}
      <div className="space-y-4">
        {loading ? (
          [1, 2].map((n) => (
            <div key={n} className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))
        ) : dayEvents.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No live sessions scheduled for {activeDay}</p>
            {sessions.length === 0 && (
              <p className="text-xs mt-1 opacity-70">No upcoming sessions found for your children</p>
            )}
          </div>
        ) : (
          dayEvents.map((ev, i) => (
            <motion.div
              key={`${ev.id}-${i}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-4 p-5 rounded-2xl border-l-4 ${
                STATUS_COLORS[ev.status] ?? STATUS_COLORS.SCHEDULED
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{ev.title}</p>
                  {ev.status === 'LIVE' && (
                    <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
                      LIVE
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      childColorMap[ev.childName] ?? CHILD_COLORS[0]
                    }`}
                  >
                    {ev.childName}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{ev.courseName}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {ev.scheduledAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(ev.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />{ev.teacherName}
                  </span>
                  {ev.status === 'LIVE' && (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                      <Video className="h-3 w-3" /> Session in progress
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
