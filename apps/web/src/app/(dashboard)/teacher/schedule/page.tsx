'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Users, MapPin, Video, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8am–5pm

const EVENTS = [
  { id: 1, title: 'Advanced Math – Chapter 4', day: 0, startHour: 9, duration: 1, type: 'class', students: 28, room: 'Room 101', color: 'bg-primary-500' },
  { id: 2, title: 'Computer Science 101', day: 1, startHour: 10, duration: 2, type: 'class', students: 22, room: 'Lab A', color: 'bg-accent-500' },
  { id: 3, title: 'Office Hours', day: 1, startHour: 14, duration: 1, type: 'office', students: 0, room: 'Room 205', color: 'bg-gray-400' },
  { id: 4, title: 'Physics Lab', day: 2, startHour: 11, duration: 2, type: 'class', students: 18, room: 'Lab B', color: 'bg-purple-500' },
  { id: 5, title: 'Live Tutoring Session', day: 2, startHour: 15, duration: 1, type: 'live', students: 12, room: 'Online', color: 'bg-rose-500' },
  { id: 6, title: 'Advanced Math – Chapter 4', day: 3, startHour: 9, duration: 1, type: 'class', students: 28, room: 'Room 101', color: 'bg-primary-500' },
  { id: 7, title: 'Computer Science 101', day: 4, startHour: 10, duration: 2, type: 'class', students: 22, room: 'Lab A', color: 'bg-accent-500' },
  { id: 8, title: 'Department Meeting', day: 3, startHour: 13, duration: 1, type: 'meeting', students: 0, room: 'Conference Room', color: 'bg-orange-500' },
];

export default function TeacherSchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekLabel = () => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7 - base.getDay() + 1);
    const end = new Date(base);
    end.setDate(end.getDate() + 4);
    return `${base.toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const todayClasses = EVENTS.filter((e) => e.type === 'class' || e.type === 'live');

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your weekly timetable</p>
        </div>
        <Link href="/teacher/live"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> New Session
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Classes this week', value: EVENTS.filter(e => e.type === 'class').length, icon: Calendar, color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30' },
          { label: 'Live sessions', value: EVENTS.filter(e => e.type === 'live').length, icon: Video, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
          { label: 'Total students', value: 72, icon: Users, color: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30' },
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

      {/* Week navigator */}
      <div className="flex items-center gap-4">
        <button onClick={() => setWeekOffset((o) => o - 1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 text-center">{getWeekLabel()}</span>
        <button onClick={() => setWeekOffset((o) => o + 1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        {weekOffset !== 0 && (
          <button onClick={() => setWeekOffset(0)} className="text-xs text-primary-600 hover:underline">Today</button>
        )}
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Day headers */}
        <div className="grid gap-px bg-gray-100 dark:bg-gray-700" style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
          <div className="bg-white dark:bg-gray-800 p-3" />
          {DAYS.map((d) => (
            <div key={d} className="bg-white dark:bg-gray-800 p-3 text-center">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{d}</p>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="grid gap-px bg-gray-100 dark:bg-gray-700" style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
          {HOURS.map((hour) => (
            <>
              <div key={`h${hour}`} className="bg-white dark:bg-gray-800 p-2 text-right">
                <span className="text-xs text-gray-400">{hour}:00</span>
              </div>
              {DAYS.map((_, dayIdx) => {
                const events = EVENTS.filter((e) => e.day === dayIdx && e.startHour === hour);
                return (
                  <div key={`${dayIdx}-${hour}`} className="bg-white dark:bg-gray-800 min-h-[60px] p-1 relative">
                    {events.map((ev) => (
                      <motion.div
                        key={ev.id}
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
                        {ev.room && (
                          <div className="flex items-center gap-1 mt-0.5 opacity-80">
                            {ev.room === 'Online' ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                            <span>{ev.room}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
