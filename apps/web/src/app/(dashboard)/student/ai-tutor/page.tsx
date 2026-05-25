'use client'

import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Bot, Send, User, Sparkles, BookOpen, Calculator, Atom, Globe, Loader2, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

type Session = {
  id: string
  subject: string
  preview: string
  createdAt: Date
}

const suggestedPrompts = [
  { icon: Calculator, text: 'Explain integration by parts with examples', subject: 'Math' },
  { icon: Atom, text: "What is Newton's Third Law of Motion?", subject: 'Physics' },
  { icon: Globe, text: 'Summarize the causes of World War I', subject: 'History' },
  { icon: BookOpen, text: 'Help me understand Shakespeare\'s Hamlet', subject: 'Literature' },
]

const mockSessions: Session[] = [
  { id: '1', subject: 'Mathematics', preview: 'Explain integration by parts...', createdAt: new Date(Date.now() - 3600000) },
  { id: '2', subject: 'Physics', preview: "Newton's Third Law...", createdAt: new Date(Date.now() - 86400000) },
  { id: '3', subject: 'Chemistry', preview: 'Balancing chemical equations...', createdAt: new Date(Date.now() - 172800000) },
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 0.2, 0.4].map((delay) => (
            <motion.div
              key={delay}
              className="w-2 h-2 rounded-full bg-violet-400"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, delay, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm your AI tutor. I can help you understand any subject, solve problems step-by-step, create practice quizzes, and explain complex concepts in simple terms. What would you like to learn today?",
      createdAt: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [sessions] = useState<Session[]>(mockSessions)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, createdAt: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate streaming response
    await new Promise((r) => setTimeout(r, 1200))
    const response = generateMockResponse(text)
    setIsTyping(false)
    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: 'assistant', content: response, createdAt: new Date() },
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="AI Tutor" subtitle="Powered by GPT-4 & Claude" />
      <div className="flex flex-1 overflow-hidden">
        {/* Session sidebar */}
        <div className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => { setMessages([{ id: '0', role: 'assistant', content: "Hi! I'm your AI tutor. What would you like to learn today?", createdAt: new Date() }]); setActiveSession(null) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-100 dark:hover:bg-violet-950/60 transition-colors"
            >
              <Plus className="w-4 h-4" /> New session
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 mb-2">Recent</p>
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSession(s.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-xl transition-colors',
                  activeSession === s.id
                    ? 'bg-violet-50 dark:bg-violet-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{s.subject}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{s.preview}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-col flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <p className="text-center text-sm text-slate-500 mb-6">Or try one of these:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedPrompts.map((p) => (
                    <button
                      key={p.text}
                      onClick={() => sendMessage(p.text)}
                      className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-left hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                        <p.icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-0.5">{p.subject}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">{p.text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn('flex items-end gap-3', msg.role === 'user' && 'flex-row-reverse')}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                      : 'bg-gradient-to-br from-primary-500 to-primary-600'
                  )}>
                    {msg.role === 'assistant'
                      ? <Bot className="w-4 h-4 text-white" />
                      : <User className="w-4 h-4 text-white" />}
                  </div>
                  <div className={cn(
                    'max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    msg.role === 'assistant'
                      ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                      : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-sm'
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="max-w-4xl mx-auto flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all"
                  style={{ minHeight: 48, maxHeight: 160 }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex-shrink-0"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              <Sparkles className="w-3 h-3 inline mr-1" />
              AI responses may not be 100% accurate. Always verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function generateMockResponse(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('integrat')) return 'Integration by parts is a technique used when you need to integrate a product of two functions.\n\nThe formula is:\n∫u dv = uv - ∫v du\n\nStep-by-step:\n1. Choose u and dv from your integral\n2. Differentiate u to get du\n3. Integrate dv to get v\n4. Apply the formula\n\nExample: ∫x·eˣ dx\n• u = x → du = dx\n• dv = eˣ dx → v = eˣ\n• Result: x·eˣ - ∫eˣ dx = x·eˣ - eˣ + C\n\nWould you like me to walk through another example?'
  if (q.includes('newton')) return "Newton's Third Law states: **For every action, there is an equal and opposite reaction.**\n\nIn simple terms:\n• When object A exerts a force on object B...\n• Object B exerts an equal force back on object A, in the opposite direction.\n\nExamples:\n🚀 Rocket propulsion — gas is pushed down, rocket goes up\n🏊 Swimming — hands push water back, body moves forward\n⚽ Kicking a ball — your foot pushes the ball, ball pushes back on your foot\n\nWant me to create a practice quiz on Newton's Laws?"
  if (q.includes('hamlet') || q.includes('shakespeare')) return "Hamlet is Shakespeare's longest play (c. 1600) and explores themes of revenge, mortality, and indecision.\n\n**Main characters:**\n• Hamlet — Prince of Denmark, protagonist\n• Claudius — Hamlet's uncle who murdered his father\n• Gertrude — Hamlet's mother, marries Claudius\n• Ophelia — Hamlet's love interest\n• Horatio — Hamlet's trusted friend\n\n**Famous quote:** 'To be, or not to be, that is the question'\n\nWould you like a full plot summary, analysis of a specific act, or essay help?"
  return `Great question! Let me break that down for you.\n\nBased on what you've asked about "${question.slice(0, 40)}...", here's a clear explanation:\n\n1. **Core concept** — This is a fundamental topic that builds on basic principles you may already know.\n\n2. **Key points** — The most important things to remember are the foundational rules and how they apply in different contexts.\n\n3. **Example** — Let me give you a practical example to make this concrete...\n\nWould you like me to:\n• Go deeper on any part of this?\n• Create practice questions?\n• Connect this to related topics?`
}
