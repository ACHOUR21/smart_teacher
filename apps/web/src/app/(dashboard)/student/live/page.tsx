'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Mic, MicOff, VideoOff, Hand, MessageSquare, Users,
  Calendar, Clock, ChevronRight, Wifi
} from 'lucide-react';

const upcomingSessions = [
  { id: 1, course: 'Advanced Mathematics', teacher: 'Mr. Al-Rashid', date: 'Today', time: '3:00 PM', duration: '60 min', status: 'live' },
  { id: 2, course: 'Physics Fundamentals', teacher: 'Ms. Carter', date: 'Today', time: '5:00 PM', duration: '45 min', status: 'scheduled' },
  { id: 3, course: 'English Literature', teacher: 'Mrs. Davis', date: 'Tomorrow', time: '9:00 AM', duration: '60 min', status: 'scheduled' },
  { id: 4, course: 'World History', teacher: 'Dr. Lee', date: 'Thu, May 28', time: '2:00 PM', duration: '50 min', status: 'scheduled' },
];

const participants = [
  { name: 'Mr. Al-Rashid', role: 'teacher', initials: 'AR', active: true },
  { name: 'You', role: 'student', initials: 'ME', active: true },
  { name: 'Sarah J.', role: 'student', initials: 'SJ', active: true },
  { name: 'Ahmed H.', role: 'student', initials: 'AH', active: false },
  { name: 'Emma W.', role: 'student', initials: 'EW', active: true },
  { name: 'James C.', role: 'student', initials: 'JC', active: false },
];

const chatMessages = [
  { from: 'Mr. Al-Rashid', text: 'Welcome everyone! Today we\'re covering derivatives.', time: '3:01 PM', isTeacher: true },
  { from: 'Sarah J.', text: 'Good afternoon!', time: '3:01 PM', isTeacher: false },
  { from: 'Ahmed H.', text: 'Ready to learn!', time: '3:02 PM', isTeacher: false },
  { from: 'Mr. Al-Rashid', text: "Let's start with the chain rule.", time: '3:05 PM', isTeacher: true },
];

export default function StudentLivePage() {
  const [inSession, setInSession] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(chatMessages);

  if (!inSession) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Sessions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Join your scheduled live classes</p>
        </div>

        <div className="space-y-4">
          {upcomingSessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
            >
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                session.status === 'live'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-primary-100 dark:bg-primary-900/30'
              }`}>
                <Video className={`h-6 w-6 ${
                  session.status === 'live' ? 'text-red-600 dark:text-red-400' : 'text-primary-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{session.course}</p>
                  {session.status === 'live' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.teacher}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.time} · {session.duration}</span>
                </div>
              </div>
              <button
                onClick={() => session.status === 'live' && setInSession(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  session.status === 'live'
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {session.status === 'live' ? 'Join Now' : 'Upcoming'}
                {session.status === 'live' && <ChevronRight className="h-4 w-4" />}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Main video area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Teacher video */}
        <div className="flex-1 bg-slate-900 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
                AR
              </div>
              <p className="text-white font-semibold">Mr. Al-Rashid</p>
              <p className="text-slate-400 text-sm">Advanced Mathematics</p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            LIVE
          </div>

          {/* Participant bar */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            {participants.filter(p => p.role === 'student').map(p => (
              <div key={p.name} className={`h-12 w-12 rounded-xl border-2 flex items-center justify-center text-xs font-bold text-white ${
                p.active
                  ? 'border-green-500 bg-slate-700'
                  : 'border-slate-600 bg-slate-800 opacity-50'
              }`}>
                {p.initials}
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-xs">
              <Wifi className="h-3.5 w-3.5 text-green-400" />
              Good connection
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMicOn(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  micOn
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {micOn ? 'Mic On' : 'Mic Off'}
              </button>
              <button
                onClick={() => setCamOn(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  camOn
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                {camOn ? 'Cam On' : 'Cam Off'}
              </button>
              <button
                onClick={() => setHandRaised(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  handRaised
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Hand className="h-4 w-4" />
                {handRaised ? 'Lower Hand' : 'Raise Hand'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowChat(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                <MessageSquare className="h-4 w-4" /> Chat
              </button>
              <button
                onClick={() => setInSession(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Session Chat</p>
                <span className="text-xs text-slate-400">{participants.length} participants</span>
              </div>
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
              <div className="flex gap-2">
                <input
                  className="flex-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-2 outline-none placeholder:text-slate-400"
                  placeholder="Type a message…"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      setMessages(p => [...p, { from: 'You', text: chatInput.trim(), time: 'Now', isTeacher: false }]);
                      setChatInput('');
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
