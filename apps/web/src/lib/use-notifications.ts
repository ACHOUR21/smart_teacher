'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket, connectSocket } from '@/lib/socket';
import { notificationsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export function useNotifications() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialFetchDone = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.getAll({ limit: 20 });
      setNotifications(res.data?.data ?? []);
      const countRes = await notificationsApi.getUnreadCount();
      setUnreadCount(countRes.data?.count ?? 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !token || initialFetchDone.current) return;
    initialFetchDone.current = true;
    fetchNotifications();
  }, [user, token, fetchNotifications]);

  useEffect(() => {
    if (!user || !token) return;

    const socket = connectSocket(token);

    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
    });

    return () => {
      socket.off('notification');
    };
  }, [user, token]);

  const markRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead, dismiss, refetch: fetchNotifications };
}
