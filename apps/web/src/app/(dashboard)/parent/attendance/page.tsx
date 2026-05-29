'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { usersApi } from '@/lib/api';

interface AttendanceRecord {
  subject: string;
  date: string;
  status: 'present' | 'absent' | 'scheduled';
  time: string;
}

interface ChildAttendance {
  name: string;
  grade: string;
  color: string;
  sessionsAttended: number;
  records: AttendanceRecord[];
}

const COLORS = [
  'from-violet-500 to-purple-400',
  'from-blue-500 to-cyan-400',
  'from-emerald-500 to-green-400',
  'from-amber-500 to-orange-400',
];

function buildAttendance(student: any, idx: number): ChildAttendance {
  const records: AttendanceRecord[] = (student.attendances ?? []).slice(0, 6).map((att: any) => ({
    subject: att.session?.title ?? 'Live Session',
    date: att.joinedAt
      ? new Date(att.joinedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : att.session?.scheduledAt
        ? new Date(att.session.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : '—',
    status: att.joinedAt ? 'present' : 'absent',
    time: att.joinedAt
      ? new Date(att.joinedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : '—',
  }));

  return {
    name: `${student.user?.firstName ?? ''} ${student.user?.lastName ?? ''}`.trim() || 'Student',
    grade: student.grade ?? '—',
    color: COLORS[idx % COLORS.length],
    sessionsAttended: student.attendances?.length ?? 0,
    records,
  };
}

const statusIcon = (s: string) => {
  if (s === 'present') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (s === 'absent') return <XCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-blue-400" />;
};

export default function ParentAttendancePage() {
  const [children, setChildren] = useState<ChildAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getMyChildren()
      .then((res) => {
        const list: any[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setChildren(list.map((s, i) => buildAttendance(s, i)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Live session participation for your children</p>
      </div>

      {children.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-center">
          <div>
            <p className="font-semibold text-slate-600 dark:text-slate-300">No children linked to your account</p>
            <p className="text-sm text-slate-400 mt-1">Contact your school administrator to link your children&apos;s accounts.</p>
          </div>
        </div>
      ) : (
        children.map((child) => (
          <div
            key={child.name}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className={`h-1.5 bg-gradient-to-r ${child.color}`} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${child.color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {child.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{child.name}</h3>
                  <p className="text-xs text-slate-500">{child.grade}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-3xl font-bold text-primary-600">{child.sessionsAttended}</p>
                  <p className="text-xs text-slate-400">sessions attended</p>
                </div>
              </div>

              {child.records.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No live session history yet</p>
              ) : (
                <>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Sessions</h4>
                  <div className="space-y-2">
                    {child.records.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                      >
                        {statusIcon(r.status)}
                        <div className="flex-1">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.subject}</span>
                          <span className="text-xs text-slate-400 ml-2">{r.date}</span>
                        </div>
                        <span className="text-xs text-slate-400">{r.time}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
