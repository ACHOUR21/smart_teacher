'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from './api';
import { ROLE_REDIRECTS } from './constants';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  isActive: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateFromStorage = useCallback(async () => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!stored) { setLoading(false); return; }
    setToken(stored);
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { hydrateFromStorage(); }, [hydrateFromStorage]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { user: u, accessToken, refreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    // Also set cookie for middleware
    document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
    setToken(accessToken);
    setUser(u);
    const roleKey = (u.role as string).toLowerCase() as keyof typeof ROLE_REDIRECTS;
    router.push(ROLE_REDIRECTS[roleKey] ?? '/student');
  }, [router]);

  const register = useCallback(async (data: any) => {
    const res = await authApi.register(data);
    const { user: u, accessToken, refreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
    setToken(accessToken);
    setUser(u);
    router.push('/onboarding');
  }, [router]);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'accessToken=; path=/; max-age=0';
    setUser(null);
    setToken(null);
    router.push('/login');
    toast.success('Signed out successfully');
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
