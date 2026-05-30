'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Send, Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { messagesApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: { firstName: string; lastName: string; avatarUrl?: string }
}

interface Conversation {
  id: string
  updatedAt: string
  lastMessage: Message | null
  participants: Array<{ id: string; firstName: string; lastName: string; role: string; avatarUrl?: string }>
}

export default function StudentMessagesPage() {
  const { user, token } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load conversations
  useEffect(() => {
    messagesApi.getConversations()
      .then((r) => {
        setConversations(r.data)
        if (r.data.length > 0) setActiveConvId(r.data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConvId) return
    messagesApi.getMessages(activeConvId)
      .then((r) => setMessages(r.data))
      .catch(() => {})
  }, [activeConvId])

  // Socket.IO for real-time messages
  useEffect(() => {
    if (!token) return
    const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000', {
      auth: { token },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('chat-message', (msg: Message & { conversationId: string }) => {
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => [...prev, msg])
      }
      // Update last message in conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId ? { ...c, lastMessage: msg, updatedAt: msg.createdAt } : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      )
    })

    return () => { socket.disconnect() }
  }, [token, activeConvId])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || !activeConvId || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    try {
      const { data } = await messagesApi.send(activeConvId, content)
      setMessages((prev) => [...prev, data])
    } catch {
      toast.error('Failed to send message')
      setInput(content)
    } finally {
      setSending(false)
    }
  }, [input, activeConvId, sending])

  const activeConv = conversations.find((c) => c.id === activeConvId)
  const otherParticipant = activeConv?.participants[0]

  const getInitials = (p: { firstName: string; lastName: string }) =>
    `${p.firstName[0]}${p.lastName[0]}`.toUpperCase()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="font-bold text-slate-900 dark:text-white mb-3">Messages</h1>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              placeholder="Search conversations…"
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 px-4">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a chat with a teacher</p>
            </div>
          ) : (
            conversations.map((c) => {
              const other = c.participants[0]
              if (!other) return null
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                    activeConvId === c.id && 'bg-slate-50 dark:bg-slate-800 border-r-2 border-primary-500'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getInitials(other)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {other.firstName} {other.lastName}
                      </p>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {c.lastMessage?.content ?? 'No messages yet'}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {activeConvId && otherParticipant ? (
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
              {getInitials(otherParticipant)}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {otherParticipant.firstName} {otherParticipant.lastName}
              </p>
              <p className="text-xs text-slate-500 capitalize">{otherParticipant.role.toLowerCase()}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto">
            {messages.map((m) => {
              const isMe = m.senderId === user?.id
              return (
                <div key={m.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[72%] px-4 py-3 rounded-2xl text-sm',
                    isMe
                      ? 'bg-primary-500 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                  )}>
                    <p>{m.content}</p>
                    <p className={cn('text-xs mt-1', isMe ? 'text-primary-200' : 'text-slate-400')}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-center text-gray-400">
            <Plus className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-700 dark:text-gray-300">Select a conversation</p>
            <p className="text-sm mt-1">or start a new one</p>
          </div>
        </div>
      )}
    </div>
  )
}
