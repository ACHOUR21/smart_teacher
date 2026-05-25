'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Video, Users, Clock, Plus, Calendar, CheckCircle2, Play, Mic, MicOff, Camera, CameraOff, MessageSquare, Share } from 'lucide-react'
import { cn } from '@/lib/utils'

const sessions = [
  { id: '1', title: 'Advanced Mathematics — Differential Equations', course: 'Advanced Mathematics', scheduledAt: 'Today 10:00 AM', students: 32, status: 'live' },
  { id: '2', title: 'Physics 101 — Newton\'s Laws Review', course: 'Physics 101', scheduledAt: 'Today 1:00 PM', students: 28, status: 'scheduled' },
  { id: '3', title: 'Chemistry — Organic Reactions', course: 'Chemistry', scheduledAt: 'Tomorrow 9:00 AM', students: 20, status: 'scheduled' },
  { id: '4', title: 'Math — Integration Practice', course: 'Advanced Mathematics', scheduledAt: 'May 22, 11:00 AM', students: 32, status: 'ended', recording: true },
  { id: '5', title: 'Physics Lab — Forces Demo', course: 'Physics 101', scheduledAt: 'May 20, 2:00 PM', students: 28, status: 'ended', recording: true },
]

type Status = 'live' | 'scheduled' | 'ended'

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  live: { label: 'LIVE', color: 'text-white', bg: 'bg-red-500' },
  scheduled: { label: 'Scheduled', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  ended: { label: 'Ended', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-700' },
}

export default function TeacherLivePage() {
  const [inSession, setInSession] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  if (inSession) {
    return (
      <div className="flex flex-col h-full bg-slate-900">
        {/* Live class UI */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md animate-pulse">LIVE</span>
            <span className="text-white font-semibold text-sm">Advanced Mathematics — Differential Equations</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Users className="w-4 h-4" /><span>24 students</span>
            <span className="ml-2">42:15</span>
          </div>
        </div>
        <div className="flex-1 flex">
          {/* Main video */}
          <div className="flex-1 flex items-center justify-center bg-slate-800 m-4 rounded-2xl relative">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">YOU</span>
              </div>
              <p className="text-slate-400 text-sm">Your camera is {camOn ? 'on' : 'off'}</p>
            </div>
            {/* Student grid */}
            <div className="absolute top-4 right-4 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-20 h-14 bg-slate-700 rounded-xl flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">S{i+1}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Chat panel */}
          <div className="w-72 flex flex-col border-l border-slate-700">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-white font-medium text-sm">Live Chat</p>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {[{u:'Alex J.',m:'Can you explain step 3 again?'},{u:'Maria S.',m:'Got it, thank you!'},{u:'Omar H.',m:'What about the constant C?'}].map((msg) => (
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
        {/* Controls */}
        <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-700">
          <button onClick={() => setMicOn(!micOn)} className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-colors', micOn ? 'bg-slate-700 text-white' : 'bg-red-500 text-white')}>
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button onClick={() => setCamOn(!camOn)} className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-colors', camOn ? 'bg-slate-700 text-white' : 'bg-red-500 text-white')}>
            {camOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </button>
          <button className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition-colors">
            <Share className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button onClick={() => setInSession(false)} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-full transition-colors">
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
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Schedule Class
          </button>
        </div>

        <div className="space-y-3">
          {sessions.map((s) => {
            const sc = statusConfig[s.status as Status]
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
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{s.scheduledAt}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{s.students} students</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {s.status === 'live' && (
                    <button onClick={() => setInSession(true)} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors">
                      <Play className="w-3.5 h-3.5" fill="white" /> Join
                    </button>
                  )}
                  {s.status === 'scheduled' && (
                    <button onClick={() => setInSession(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                      <Play className="w-3.5 h-3.5" fill="white" /> Start
                    </button>
                  )}
                  {s.status === 'ended' && s.recording && (
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
                      <Video className="w-3.5 h-3.5" /> Recording
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
