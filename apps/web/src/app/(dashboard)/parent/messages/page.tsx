'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Send, Loader2 } from 'lucide-react'
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

export default function ParentMessagesPage() {
  const { user, token } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
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

  // Socket.IO real-time
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
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === msg.conversationId
              ? { ...c, lastMessage: msg, updatedAt: msg.createdAt }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      )
    })

    return () => { socket.disconnect() }
  }, [token, activeConvId])

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

  const getInitials = (p: { firstName: string; lastName: string }) =>
    `${p.firstName[0]}${p.lastName[0]}`.toUpperCase()

  const filtered = conversations.filter((c) => {
    const other = c.participants[0]
    if (!other) return false
    return `${other.firstName} ${other.lastName}`.toLowerCase().includes(query.toLowerCase())
  })

  const activeConv = conversations.find((c) => c.id === activeConvId)
  const otherParticipant = activeConv?.participants[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-slate-100 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h1 className="font-bold text-slate-900 dark:text-white mb-3">Messages</h1>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="bg-transparent flex-1 text-sm outline-none placeholder:text-slate-400"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 px-4">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Message a teacher to get started</p>
            </div>
          ) : (
            filtered.map((c) => {
              const other = c.participants[0]
              if (!other) return null
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 text-left transition-colors',
                    activeConvId === c.id
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  )}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(other)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {other.firstName} {other.lastName}
                      </span>
                      <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 capitalize">{other.role.toLowerCase()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
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
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(otherParticipant)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {otherParticipant.firstName} {otherParticipant.lastName}
              </p>
              <p className="text-xs text-slate-400 capitalize">{otherParticipant.role.toLowerCase()}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
            {messages.map((m) => {
              const isMe = m.senderId === user?.id
              return (
                <div key={m.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm',
                    isMe
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-bl-sm'
                  )}>
                    <p>{m.content}</p>
                    <p className={cn('text-[10px] mt-1', isMe ? 'text-primary-200' : 'text-slate-400')}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <input
                className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-slate-400"
                placeholder="Type a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-center text-gray-400">
            <p className="font-medium text-gray-700 dark:text-gray-300">No conversation selected</p>
            <p className="text-sm mt-1">Choose one from the list</p>
          </div>
        </div>
      )}
    </div>
  )
}
