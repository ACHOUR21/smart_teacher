'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video, Mic, MicOff, VideoOff, Hand, MessageSquare,
  Users, Calendar, Clock, ChevronRight, Wifi, Loader2
} from 'lucide-react'
import { liveApi } from '@/lib/api'
import { toast } from 'sonner'

interface LiveSession {
  id: string
  title: string
  status: 'SCHEDULED' | 'LIVE' | 'ENDED'
  scheduledAt?: string
  startedAt?: string
  course?: { title: string; subject?: string }
  teacher?: { firstName: string; lastName: string }
  roomId?: string
  _count?: { participants?: number }
}

const chatMessages = [
  { from: 'Teacher', text: "Welcome everyone! Let's get started.", time: 'Now', isTeacher: true },
  { from: 'You', text: 'Ready!', time: 'Now', isTeacher: false },
]

function sessionDate(s: LiveSession) {
  const dateStr = s.scheduledAt ?? s.startedAt
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diff = d.getDate() - now.getDate()
  if (diff === 0 && d.getFullYear() === now.getFullYear()) return `Today · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  if (diff === 1) return `Tomorrow · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleString()
}

export default function StudentLivePage() {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [inSession, setInSession] = useState(false)
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [micOn, setMicOn] = useState(false)
  const [camOn, setCamOn] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState(chatMessages)

  useEffect(() => {
    liveApi.getSessions()
      .then((r) => {
        const data: LiveSession[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
        const active = data.filter((s) => s.status === 'LIVE' || s.status === 'SCHEDULED')
        setSessions(active)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const join = async (session: LiveSession) => {
    setJoiningId(session.id)
    try {
      await liveApi.join(session.id)
      setActiveSession(session)
      setInSession(true)
    } catch {
      toast.error('Failed to join session')
    } finally {
      setJoiningId(null)
    }
  }

  if (inSession && activeSession) {
    const initials = activeSession.teacher
      ? `${activeSession.teacher.firstName[0]}${activeSession.teacher.lastName[0]}`
      : 'T'
    return (
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 bg-slate-900 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
                  {initials.toUpperCase()}
                </div>
                <p className="text-white font-semibold">
                  {activeSession.teacher
                    ? `${activeSession.teacher.firstName} ${activeSession.teacher.lastName}`
                    : 'Teacher'}
                </p>
                <p className="text-slate-400 text-sm">{activeSession.course?.title}</p>
              </div>
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-xs">
              <Wifi className="h-3.5 w-3.5 text-green-400" />
              Connected
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMicOn((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    micOn ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  {micOn ? 'Mic On' : 'Mic Off'}
                </button>
                <button
                  onClick={() => setCamOn((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    camOn ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  {camOn ? 'Cam On' : 'Cam Off'}
                </button>
                <button
                  onClick={() => setHandRaised((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    handRaised ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  <Hand className="h-4 w-4" />
                  {handRaised ? 'Lower Hand' : 'Raise Hand'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChat((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  <MessageSquare className="h-4 w-4" /> Chat
                </button>
                <button
                  onClick={() => { setInSession(false); setActiveSession(null) }}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Session Chat</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-xs font-semibold ${
                        msg.isTeacher ? 'text-primary-600' : 'text-slate-700 dark:text-slate-300'
                      }`}>{msg.from}</span>
                      <span className="text-[10px] text-slate-400">{msg.time}</span>
                    </div>
                    <p className={`text-xs px-3 py-2 rounded-xl ${
                      msg.isTeacher
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>{msg.text}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                <input
                  className="w-full text-xs bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-2 outline-none placeholder:text-slate-400"
                  placeholder="Type a message…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      setMessages((p) => [...p, { from: 'You', text: chatInput.trim(), time: 'Now', isTeacher: false }])
                      setChatInput('')
                    }
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Sessions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Join your scheduled live classes</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Video className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium text-slate-600 dark:text-slate-300">No upcoming sessions</p>
          <p className="text-sm mt-1">Your teacher hasn\'t scheduled any sessions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
            >
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                session.status === 'LIVE'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-primary-100 dark:bg-primary-900/30'
              }`}>
                <Video className={`h-6 w-6 ${
                  session.status === 'LIVE' ? 'text-red-600 dark:text-red-400' : 'text-primary-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{session.title}</p>
                  {session.status === 'LIVE' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full flex-shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                  {session.teacher && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {session.teacher.firstName} {session.teacher.lastName}
                    </span>
                  )}
                  {session.course && (
                    <span>{session.course.title}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {sessionDate(session)}
                  </span>
                </div>
              </div>
              <button
                disabled={joiningId === session.id}
                onClick={() => join(session)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  session.status === 'LIVE'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } disabled:opacity-60`}
              >
                {joiningId === session.id
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : session.status === 'LIVE' ? 'Join Now' : 'Ready'}
                {joiningId !== session.id && <ChevronRight className="h-4 w-4" />}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
