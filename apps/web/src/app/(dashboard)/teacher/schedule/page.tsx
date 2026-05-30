'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Users, Video, ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { liveApi } from '@/lib/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8);

const EVENT_COLORS = [
  'bg-primary-500', 'bg-accent-500', 'bg-purple-500',
  'bg-rose-500', 'bg-orange-500', 'bg-teal-500',
];

function sessionToEvent(s: any, idx: number) {
  const date = s.scheduledAt ? new Date(s.scheduledAt) : null;
  const dayOfWeek = date ? date.getDay() : 0;
  const dayIdx = dayOfWeek === 0 ? 4 : Math.min(dayOfWeek - 1, 4);
  const startHour = date ? date.getHours() : 9 + (idx % 4);
  const clamped = Math.min(Math.max(startHour, 8), 16);
  return {
    id: s.id,
    title: s.title ?? 'Live Session',
    day: dayIdx,
    startHour: clamped,
    duration: 1,
    type: s.status === 'LIVE' ? 'live' : 'class',
    status: s.status,
    students: s._count?.participants ?? s.participantCount ?? 0,
    room: s.roomId ? `Room ${s.roomId.slice(0, 4)}` : 'Online',
    color: EVENT_COLORS[idx % EVENT_COLORS.length],
  };
}

export default function TeacherSchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    liveApi.getSessions({ limit: 20 })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setEvents(list.map(sessionToEvent));
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  function getWeekLabel() {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7 - base.getDay() + 1);
    const end = new Date(base);
    end.setDate(end.getDate() + 4);
    return `${base.toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  const liveCount = events.filter(e => e.status === 'LIVE').length;
  const scheduledCount = events.filter(e => e.status === 'SCHEDULED').length;
  const totalStudents = events.reduce((s, e) => s + (e.students ?? 0), 0);

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your weekly timetable</p>
        </div>
        <Link href="/teacher/live"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> New Session
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Scheduled', value: loading ? '…' : scheduledCount, icon: Calendar, color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30' },
          { label: 'Live Now', value: loading ? '…' : liveCount, icon: Video, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
          { label: 'Total Participants', value: loading ? '…' : totalStudents, icon: Users, color: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 text-center">{getWeekLabel()}</span>
        <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        {weekOffset !== 0 && (
          <button onClick={() => setWeekOffset(0)} className="text-xs text-primary-600 hover:underline">Today</button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid gap-px bg-gray-100 dark:bg-gray-700" style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
            <div className="bg-white dark:bg-gray-800 p-3" />
            {DAYS.map(d => (
              <div key={d} className="bg-white dark:bg-gray-800 p-3 text-center">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{d}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-px bg-gray-100 dark:bg-gray-700" style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
            {HOURS.map(hour => (
              <>
                <div key={`h${hour}`} className="bg-white dark:bg-gray-800 p-2 text-right">
                  <span className="text-xs text-gray-400">{hour}:00</span>
                </div>
                {DAYS.map((_, dayIdx) => {
                  const dayEvents = events.filter(e => e.day === dayIdx && e.startHour === hour);
                  return (
                    <div key={`${dayIdx}-${hour}`} className="bg-white dark:bg-gray-800 min-h-[60px] p-1 relative">
                      {dayEvents.map(ev => (
                        <motion.div key={ev.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`${ev.color} text-white rounded-lg p-2 text-xs mb-1 cursor-pointer hover:opacity-90 transition-opacity`}
                          style={{ minHeight: `${ev.duration * 56}px` }}
                        >
                          <p className="font-medium leading-tight truncate">{ev.title}</p>
                          <div className="flex items-center gap-1 mt-1 opacity-80">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{ev.startHour}:00–{ev.startHour + ev.duration}:00</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 opacity-80">
                            <Video className="w-2.5 h-2.5" />
                            <span>{ev.room}</span>
                          </div>
                          {ev.status === 'LIVE' && (
                            <span className="mt-1 inline-block text-[9px] bg-white/30 rounded px-1">LIVE</span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
          {events.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No sessions scheduled</p>
              <Link href="/teacher/live" className="text-xs text-primary-600 hover:underline mt-1 block">Schedule a session</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
