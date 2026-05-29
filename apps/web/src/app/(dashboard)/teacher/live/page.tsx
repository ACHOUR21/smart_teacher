'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import {
  Video, Users, Clock, Plus, Calendar, Play,
  Mic, MicOff, Camera, CameraOff, MessageSquare,
  Share, Loader2, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { liveApi } from '@/lib/api'
import { toast } from 'sonner'

interface LiveSession {
  id: string
  title: string
  status: 'SCHEDULED' | 'LIVE' | 'ENDED'
  scheduledAt?: string
  startedAt?: string
  course?: { title: string }
  _count?: { participants?: number }
  roomId?: string
}

const STATUS_CONFIG = {
  LIVE: { label: 'LIVE', color: 'text-white', bg: 'bg-red-500' },
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  ENDED: { label: 'Ended', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-700' },
}

function sessionDate(s: LiveSession) {
  const dateStr = s.scheduledAt ?? s.startedAt
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return `Today ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleString()
}

export default function TeacherLivePage() {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [inSession, setInSession] = useState(false)
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ title: '', courseId: '', scheduledAt: '' })
  const [scheduling, setScheduling] = useState(false)

  const fetchSessions = () => {
    setLoading(true)
    liveApi.getSessions()
      .then((r) => {
        const data: LiveSession[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
        setSessions(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSessions() }, [])

  const startSession = async (session: LiveSession) => {
    setActionId(session.id)
    try {
      if (session.status === 'SCHEDULED') {
        await liveApi.start(session.id)
        setSessions((prev) => prev.map((s) => s.id === session.id ? { ...s, status: 'LIVE' } : s))
      }
      setActiveSession(session)
      setInSession(true)
    } catch {
      toast.error('Failed to start session')
    } finally {
      setActionId(null)
    }
  }

  const endSession = async () => {
    if (!activeSession) return
    try {
      await liveApi.end(activeSession.id)
      setSessions((prev) => prev.map((s) => s.id === activeSession.id ? { ...s, status: 'ENDED' } : s))
    } catch {
      // non-critical
    }
    setInSession(false)
    setActiveSession(null)
  }

  const scheduleSession = async () => {
    if (!scheduleForm.title.trim()) return
    setScheduling(true)
    try {
      const { data } = await liveApi.create({
        title: scheduleForm.title,
        courseId: scheduleForm.courseId || undefined,
        scheduledAt: scheduleForm.scheduledAt || undefined,
      })
      setSessions((prev) => [data, ...prev])
      setShowSchedule(false)
      setScheduleForm({ title: '', courseId: '', scheduledAt: '' })
      toast.success('Session scheduled')
    } catch {
      toast.error('Failed to schedule session')
    } finally {
      setScheduling(false)
    }
  }

  if (inSession && activeSession) {
    return (
      <div className="flex flex-col h-full bg-slate-900">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md animate-pulse">LIVE</span>
            <span className="text-white font-semibold text-sm">{activeSession.title}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Users className="w-4 h-4" />
            <span>{activeSession._count?.participants ?? 0} participants</span>
          </div>
        </div>
        <div className="flex-1 flex">
          <div className="flex-1 flex items-center justify-center bg-slate-800 m-4 rounded-2xl relative">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">YOU</span>
              </div>
              <p className="text-slate-400 text-sm">Your camera is {camOn ? 'on' : 'off'}</p>
            </div>
          </div>
          <div className="w-72 flex flex-col border-l border-slate-700">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-white font-medium text-sm">Live Chat</p>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {[{ u: 'Student A', m: 'Hello teacher!' }, { u: 'Student B', m: 'Ready to learn!' }].map((msg) => (
                <div key={msg.u} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs flex-shrink-0">{msg.u[0]}</div>
                  <div>
                    <p className="text-xs text-slate-400">{msg.u}</p>
                    <p className="text-xs text-slate-200 mt-0.5">{msg.m}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-700">
              <input placeholder="Reply..." className="w-full px-3 py-2 bg-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-700">
          <button
            onClick={() => setMicOn(!micOn)}
            className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-colors', micOn ? 'bg-slate-700 text-white' : 'bg-red-500 text-white')}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setCamOn(!camOn)}
            className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-colors', camOn ? 'bg-slate-700 text-white' : 'bg-red-500 text-white')}
          >
            {camOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </button>
          <button className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition-colors">
            <Share className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button onClick={endSession} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-full transition-colors">
            End Class
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Live Classes" subtitle="Schedule and manage your sessions" />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Schedule Class
          </button>
        </div>

        {/* Schedule modal */}
        {showSchedule && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Schedule New Session</h3>
              <button onClick={() => setShowSchedule(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Session Title</label>
                <input
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="e.g. Chapter 5 — Derivatives"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Scheduled At</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduledAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSchedule(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button
                onClick={scheduleSession}
                disabled={!scheduleForm.title.trim() || scheduling}
                className="px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {scheduling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Schedule
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Video className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No sessions yet</p>
            <p className="text-sm mt-1">Schedule your first live class</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const sc = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.ENDED
              return (
                <div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{s.title}</p>
                      <span className={cn('px-2 py-0.5 text-xs font-bold rounded-md flex-shrink-0', sc.bg, sc.color)}>{sc.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{sessionDate(s)}</span>
                      {s._count?.participants != null && (
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{s._count.participants}</span>
                      )}
                      {s.course && <span>{s.course.title}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {s.status !== 'ENDED' && (
                      <button
                        disabled={actionId === s.id}
                        onClick={() => startSession(s)}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-60',
                          s.status === 'LIVE'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        )}
                      >
                        {actionId === s.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Play className="w-3.5 h-3.5" fill="white" />}
                        {s.status === 'LIVE' ? 'Rejoin' : 'Start'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
