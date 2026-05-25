'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const events: Record<string, { name: string; child: string; teacher: string; room: string; time: string; color: string }[]> = {
  Mon: [
    { name: 'Advanced Math', child: 'Layla', teacher: 'Mr. Al-Rashid', room: 'Room 204', time: '8:00 – 9:30', color: 'bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500' },
    { name: 'Mathematics', child: 'Omar', teacher: 'Ms. Thompson', room: 'Room 108', time: '9:00 – 10:00', color: 'bg-purple-100 border-purple-400 dark:bg-purple-900/30 dark:border-purple-500' },
    { name: 'English Lit', child: 'Layla', teacher: 'Mrs. Davis', room: 'Room 312', time: '10:00 – 11:30', color: 'bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-500' },
  ],
  Tue: [
    { name: 'Physics', child: 'Layla', teacher: 'Ms. Carter', room: 'Lab 3', time: '8:00 – 9:30', color: 'bg-amber-100 border-amber-400 dark:bg-amber-900/30 dark:border-amber-500' },
    { name: 'Arabic Language', child: 'Omar', teacher: 'Ms. Khalil', room: 'Room 205', time: '10:00 – 11:00', color: 'bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-500' },
  ],
  Wed: [
    { name: 'Advanced Math', child: 'Layla', teacher: 'Mr. Al-Rashid', room: 'Room 204', time: '8:00 – 9:30', color: 'bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500' },
    { name: 'Science', child: 'Omar', teacher: 'Mr. Patel', room: 'Lab 1', time: '9:00 – 10:30', color: 'bg-teal-100 border-teal-400 dark:bg-teal-900/30 dark:border-teal-500' },
    { name: 'World History', child: 'Layla', teacher: 'Dr. Lee', room: 'Room 401', time: '11:00 – 12:30', color: 'bg-orange-100 border-orange-400 dark:bg-orange-900/30 dark:border-orange-500' },
  ],
  Thu: [
    { name: 'Physics', child: 'Layla', teacher: 'Ms. Carter', room: 'Lab 3', time: '8:00 – 9:30', color: 'bg-amber-100 border-amber-400 dark:bg-amber-900/30 dark:border-amber-500' },
    { name: 'Physical Education', child: 'Omar', teacher: 'Coach Rivera', room: 'Gym', time: '10:00 – 11:00', color: 'bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-500' },
  ],
  Fri: [
    { name: 'English Lit', child: 'Layla', teacher: 'Mrs. Davis', room: 'Room 312', time: '9:00 – 10:30', color: 'bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-500' },
    { name: 'Mathematics', child: 'Omar', teacher: 'Ms. Thompson', room: 'Room 108', time: '10:00 – 11:00', color: 'bg-purple-100 border-purple-400 dark:bg-purple-900/30 dark:border-purple-500' },
  ],
};

const today = new Date();

export default function ParentSchedulePage() {
  const [activeDay, setActiveDay] = useState(DAYS[today.getDay() === 0 || today.getDay() === 6 ? 0 : today.getDay() - 1]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Class Schedule</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Weekly schedule for all your children</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeDay === day
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Events */}
      <div className="space-y-4">
        {(events[activeDay] ?? []).length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No classes scheduled</p>
          </div>
        ) : (
          (events[activeDay] ?? []).map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-4 p-5 rounded-2xl border-l-4 ${ev.color}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{ev.name}</p>
                  <span className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded-full font-medium">
                    {ev.child}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.time}</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{ev.teacher}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.room}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
