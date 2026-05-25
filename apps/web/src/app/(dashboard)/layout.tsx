'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import type { Role } from '@/lib/constants'

function getRoleFromPath(pathname: string): Role {
  if (pathname.startsWith('/teacher')) return 'teacher'
  if (pathname.startsWith('/student')) return 'student'
  if (pathname.startsWith('/parent')) return 'parent'
  if (pathname.startsWith('/admin')) return 'admin'
  return 'student'
}

const MOCK_USER = { name: 'Alex Johnson', email: 'alex@school.edu' }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const role = getRoleFromPath(pathname)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar
        role={role}
        user={MOCK_USER}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
