'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Plus, Bot, User, Loader2 } from 'lucide-react'
import { aiApi } from '@/lib/api'

const SUGGESTED_PROMPTS = [
  { icon: '🧮', label: 'Explain integration by parts', prompt: 'Can you explain integration by parts with a worked example?' },
  { icon: '⚗️', label: "Newton's laws", prompt: "Explain Newton's three laws of motion with real-world examples." },
  { icon: '📚', label: 'Hamlet themes', prompt: "What are the major themes in Shakespeare's Hamlet?" },
  { icon: '🌍', label: 'World War II causes', prompt: 'What were the main causes of World War II?' },
]

interface Message { role: 'user' | 'assistant'; content: string }
interface Session { id: string; title: string; lastMessage: string }

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function getMockReply(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('integration') || q.includes('integral'))
    return `Integration by Parts uses: ∫u·dv = u·v − ∫v·du\n\nExample: ∫x·eˣ dx\n- u = x, dv = eˣ dx\n- du = dx, v = eˣ\n\nResult: x·eˣ − eˣ + C = eˣ(x−1) + C`
  if (q.includes('newton') || q.includes('motion'))
    return `Newton's Three Laws:\n\n1. Inertia — objects in motion stay in motion.\n2. F = ma — force equals mass times acceleration.\n3. Action-Reaction — every action has an equal opposite reaction.`
  if (q.includes('hamlet') || q.includes('shakespeare'))
    return `Major themes in Hamlet:\n\n- Revenge vs. Conscience\n- Corruption & Decay\n- Appearance vs. Reality\n- Death & Mortality\n- Madness (real and feigned)`
  return `Great question! Key concepts to understand:\n\n1. Foundation — start with the basics.\n2. Application — practice with examples.\n3. Review — test yourself regularly.\n\nWould you like me to go deeper on any aspect?`
}

export default function StudentAITutorPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load existing sessions on mount
  useEffect(() => {
    aiApi.getSessions()
      .then((r) => {
        const data = r.data ?? []
        const sessionList: Session[] = data.map((s: any) => ({
          id: s.id,
          title: s.title ?? 'Chat',
          lastMessage: s.messages?.[s.messages.length - 1]?.content?.slice(0, 60) ?? '',
        }))
        setSessions(sessionList)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function newSession() {
    setSessionLoading(true)
    try {
      const res = await aiApi.createSession({ title: 'New Chat' })
      const session: Session = { id: res.data.id, title: res.data.title, lastMessage: '' }
      setSessions((p) => [session, ...p])
      setActiveSessionId(session.id)
      setMessages([])
    } catch {
      const id = `local-${Date.now()}`
      setSessions((p) => [{ id, title: 'New Chat', lastMessage: '' }, ...p])
      setActiveSessionId(id)
      setMessages([])
    } finally {
      setSessionLoading(false)
    }
  }

  async function loadSession(id: string) {
    setActiveSessionId(id)
    try {
      const res = await aiApi.getSession(id)
      setMessages(
        (res.data.messages ?? []).map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      )
    } catch {
      setMessages([])
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return
    const userMsg: Message = { role: 'user', content }
    setMessages((p) => [...p, userMsg])
    setInput('')
    setIsLoading(true)

    setSessions((p) =>
      p.map((s) => s.id === activeSessionId ? { ...s, lastMessage: content.slice(0, 60) } : s)
    )

    try {
      const isLocal = !activeSessionId || activeSessionId.startsWith('local')
      if (!isLocal) {
        const res = await aiApi.chat(activeSessionId!, content)
        setMessages((p) => [...p, { role: 'assistant', content: res.data.reply ?? res.data.message ?? '' }])
      } else {
        await new Promise((r) => setTimeout(r, 1000))
        setMessages((p) => [...p, { role: 'assistant', content: getMockReply(content) }])
      }
    } catch {
      await new Promise((r) => setTimeout(r, 800))
      setMessages((p) => [...p, { role: 'assistant', content: getMockReply(content) }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Session sidebar */}
      <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <button
            onClick={newSession}
            disabled={sessionLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
          >
            {sessionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => loadSession(s.id)}
              className={`w-full flex items-start gap-2.5 p-3 rounded-xl text-left transition-colors ${
                activeSessionId === s.id
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
              }`}
            >
              <Bot className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                activeSessionId === s.id ? 'text-primary-600' : 'text-slate-400'
              }`} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{s.title}</p>
                {s.lastMessage && (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{s.lastMessage}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-0">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Tutor</p>
            <p className="text-xs text-slate-400">Powered by Claude</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-slate-400">Online</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !activeSessionId && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">How can I help you today?</h3>
              <p className="text-sm text-slate-400 mb-8 text-center max-w-xs">
                Ask me anything about your studies. I\'m here to explain, guide, and help you learn.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { if (!activeSessionId) setActiveSessionId('demo'); sendMessage(p.prompt) }}
                    className="flex items-start gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-left hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="h-7 w-7 rounded-xl bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (!activeSessionId) setActiveSessionId('demo')
                  sendMessage(input)
                }
              }}
              placeholder="Ask me anything… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 text-slate-900 dark:text-white max-h-32"
            />
            <button
              onClick={() => { if (!activeSessionId) setActiveSessionId('demo'); sendMessage(input) }}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
