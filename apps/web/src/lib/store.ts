import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (v) => set({ collapsed: v }),
    }),
    { name: 'sidebar' }
  )
);

// ── Notifications ─────────────────────────────────────────────────────────────
interface NotifItem {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotifState {
  items: NotifItem[];
  unread: number;
  setItems: (items: NotifItem[]) => void;
  push: (item: NotifItem) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}

export const useNotifStore = create<NotifState>()(
  devtools(
    (set) => ({
      items: [],
      unread: 0,
      setItems: (items) =>
        set({ items, unread: items.filter((n) => !n.isRead).length }),
      push: (item) =>
        set((s) => ({ items: [item, ...s.items].slice(0, 50), unread: s.unread + 1 })),
      markRead: (id) =>
        set((s) => ({
          items: s.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          unread: Math.max(0, s.unread - (s.items.find((n) => n.id === id)?.isRead ? 0 : 1)),
        })),
      markAllRead: () =>
        set((s) => ({ items: s.items.map((n) => ({ ...n, isRead: true })), unread: 0 })),
      dismiss: (id) =>
        set((s) => ({
          items: s.items.filter((n) => n.id !== id),
          unread: s.unread - (s.items.find((n) => n.id === id && !n.isRead) ? 1 : 0),
        })),
    }),
    { name: 'notifications' }
  )
);

// ── AI Tutor chat ─────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface AIStore {
  sessions: { id: string; title: string }[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  typing: boolean;
  setSessions: (sessions: { id: string; title: string }[]) => void;
  setActiveSession: (id: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendMessage: (msg: ChatMessage) => void;
  setTyping: (v: boolean) => void;
}

export const useAIStore = create<AIStore>()(devtools(
  (set) => ({
    sessions: [],
    activeSessionId: null,
    messages: [],
    typing: false,
    setSessions: (sessions) => set({ sessions }),
    setActiveSession: (id) => set({ activeSessionId: id, messages: [] }),
    setMessages: (messages) => set({ messages }),
    appendMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
    setTyping: (v) => set({ typing: v }),
  }),
  { name: 'ai-store' }
));

// ── Theme preference ──────────────────────────────────────────────────────────
interface ThemeStore {
  locale: 'en' | 'ar' | 'fr';
  setLocale: (l: 'en' | 'ar' | 'fr') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'theme-prefs' }
  )
);
