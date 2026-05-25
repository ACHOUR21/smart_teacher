'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Search } from 'lucide-react';

const conversations = [
  {
    id: 1, name: 'Mr. Al-Rashid', role: 'Math Teacher', avatar: 'AR',
    last: "Layla's performance has improved significantly!", time: '5m ago', unread: 1, online: true,
  },
  {
    id: 2, name: 'Ms. Carter', role: 'Physics Teacher', avatar: 'MC',
    last: 'Please sign the permission slip for the lab.', time: '2h ago', unread: 2, online: false,
  },
  {
    id: 3, name: 'Dr. Smith', role: 'School Admin', avatar: 'DS',
    last: 'Reminder: Parent-Teacher conference on Friday.', time: 'Yesterday', unread: 0, online: true,
  },
  {
    id: 4, name: 'Ms. Thompson', role: "Omar's Teacher", avatar: 'MT',
    last: 'Omar needs to complete assignment 3.', time: '2 days ago', unread: 0, online: false,
  },
];

const initialMessages: Record<number, { from: 'me' | 'them'; text: string; time: string }[]> = {
  1: [
    { from: 'them', text: "Good morning! I wanted to share some great news about Layla.", time: '8:00 AM' },
    { from: 'me', text: "Oh wonderful! What happened?", time: '8:05 AM' },
    { from: 'them', text: "Layla's performance has improved significantly!", time: '8:06 AM' },
  ],
  2: [
    { from: 'them', text: 'We have a lab session next week that requires parental consent.', time: 'Yesterday' },
    { from: 'them', text: 'Please sign the permission slip for the lab.', time: '2h ago' },
  ],
  3: [
    { from: 'them', text: 'Reminder: Parent-Teacher conference on Friday.', time: 'Yesterday' },
    { from: 'me', text: 'Thank you for the reminder, we will be there.', time: 'Yesterday' },
  ],
  4: [
    { from: 'them', text: 'Omar needs to complete assignment 3.', time: '2 days ago' },
    { from: 'me', text: "I will make sure he completes it tonight.", time: '2 days ago' },
  ],
};

export default function ParentMessagesPage() {
  const [activeId, setActiveId] = useState(1);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations.find(c => c.id === activeId)!;
  const filtered = conversations.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeId]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), { from: 'me', text, time: 'Just now' }] }));
    setInput('');
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="w-72 flex-shrink-0 border-r border-slate-100 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
            <Search className="h-4 w-4 text-slate-400" />
            <input className="bg-transparent flex-1 text-sm outline-none placeholder:text-slate-400" placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)} className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${ activeId === c.id ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30' }`}>
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{c.avatar}</div>
                {c.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-800" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.name}</span>
                  <span className="text-xs text-slate-400 ml-2">{c.time}</span>
                </div>
                <p className="text-xs text-slate-400">{c.role}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{c.last}</p>
              </div>
              {c.unread > 0 && <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{active.avatar}</div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{active.name}</p>
            <p className="text-xs text-slate-400">{active.role}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {(messages[activeId] ?? []).map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${ msg.from === 'me' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-sm' }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${ msg.from === 'me' ? 'text-primary-200' : 'text-slate-400' }`}>{msg.time}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-600"><Paperclip className="h-5 w-5" /></button>
            <input className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-slate-400" placeholder="Type a message…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button onClick={send} className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
