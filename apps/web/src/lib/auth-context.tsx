'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi } from '@/lib/api'
import type { UserDTO } from '@edu/shared-types'

interface AuthContextValue {
  user: UserDTO | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; role: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('edu_access_token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('edu_access_token')
        localStorage.removeItem('edu_refresh_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('edu_access_token', data.accessToken)
    localStorage.setItem('edu_refresh_token', data.refreshToken)
    setUser(data.user)
  }, [])

  const register = useCallback(async (payload: any) => {
    const data = await authApi.register(payload)
    localStorage.setItem('edu_access_token', data.accessToken)
    localStorage.setItem('edu_refresh_token', data.refreshToken)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('edu_refresh_token') ?? ''
    await authApi.logout(refreshToken).catch(() => {})
    localStorage.removeItem('edu_access_token')
    localStorage.removeItem('edu_refresh_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
