'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Search, Send, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

const conversations = [
  { id: '1', name: 'Dr. Sarah Mitchell', role: 'Mathematics Teacher', avatar: 'SM', lastMessage: 'Great work on the quiz!', time: '2h ago', unread: 1, color: 'from-blue-500 to-cyan-400' },
  { id: '2', name: 'Prof. James Cooper', role: 'Physics Teacher', avatar: 'JC', lastMessage: 'Please resubmit the lab report with corrections.', time: '1d ago', unread: 0, color: 'from-violet-500 to-purple-400' },
  { id: '3', name: 'Ms. Emily Davis', role: 'Literature Teacher', avatar: 'ED', lastMessage: 'The essay was excellent!', time: '2d ago', unread: 0, color: 'from-rose-500 to-pink-400' },
  { id: '4', name: 'Class: Advanced Math', role: 'Group · 32 members', avatar: 'AM', lastMessage: 'Dr. Mitchell: Next class is Tuesday', time: '3h ago', unread: 5, color: 'from-amber-500 to-orange-400' },
]

const messages = [
  { id: '1', role: 'assistant', text: 'Hi Alex! I just reviewed your Chapter 5 quiz. You scored 95/100 — excellent work! You made a small error in problem 7. Want me to explain it?', time: '10:02 AM' },
  { id: '2', role: 'user', text: 'Yes please! I wasn\'t sure about that one.', time: '10:05 AM' },
  { id: '3', role: 'assistant', text: "In problem 7, you needed to apply the chain rule before the product rule. The correct approach is: d/dx[f(g(x))·h(x)] = f'(g(x))·g'(x)·h(x) + f(g(x))·h'(x). Makes sense?", time: '10:07 AM' },
  { id: '4', role: 'user', text: 'Oh I see! Thank you so much!', time: '10:09 AM' },
  { id: '5', role: 'assistant', text: "Great work on the quiz! Keep it up 🌟", time: '10:10 AM' },
]

export default function StudentMessagesPage() {
  const [active, setActive] = useState('1')
  const [input, setInput] = useState('')
  const activeConv = conversations.find((c) => c.id === active)!

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="font-bold text-slate-900 dark:text-white mb-3">Messages</h1>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input placeholder="Search..." className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={cn('w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors', active === c.id && 'bg-slate-50 dark:bg-slate-800 border-r-2 border-primary-500')}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>{c.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.name}</p>
                  <span className="text-xs text-slate-400 flex-shrink-0">{c.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{c.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${activeConv.color} flex items-center justify-center text-white text-sm font-bold`}>{activeConv.avatar}</div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{activeConv.name}</p>
            <p className="text-xs text-slate-500">{activeConv.role}</p>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[72%] px-4 py-3 rounded-2xl text-sm', m.role === 'user' ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm')}>
                <p>{m.text}</p>
                <p className={cn('text-xs mt-1', m.role === 'user' ? 'text-primary-200' : 'text-slate-400')}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && setInput('')}
            />
            <button onClick={() => setInput('')} className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
