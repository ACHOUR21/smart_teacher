'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Sparkles, Video, ClipboardList,
  BarChart3, Users, MessageSquare, Settings, Bot, TrendingUp,
  Calendar, Clock, CreditCard, Shield, FileText, GraduationCap,
  Heart, LogOut, ChevronLeft, Cpu, BarChart2, MessageCircle,
  UserCheck, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { NAV_ITEMS } from '@/lib/constants'

type SidebarRole = 'teacher' | 'student' | 'parent' | 'admin'

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, BookOpen, Sparkles, Video, ClipboardList,
  BarChart3, BarChart2, Users, MessageSquare, MessageCircle,
  Settings, Bot, TrendingUp, Calendar, Clock, CreditCard,
  Shield, FileText, Cpu, UserCheck, Star,
}

const ROLE_META: Record<SidebarRole, {
  label: string
  color: string
  gradient: string
  icon: React.ElementType
}> = {
  teacher: {
    label: 'Teacher',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-400',
    icon: GraduationCap,
  },
  student: {
    label: 'Student',
    color: 'text-violet-600',
    gradient: 'from-violet-500 to-purple-400',
    icon: BookOpen,
  },
  parent: {
    label: 'Parent',
    color: 'text-rose-600',
    gradient: 'from-rose-500 to-pink-400',
    icon: Heart,
  },
  admin: {
    label: 'Admin',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-400',
    icon: Shield,
  },
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { collapsed, toggle } = useSidebar()
  const { user, logout } = useAuth()

  const role = ((user?.role ?? 'student').toLowerCase()) as SidebarRole
  const meta = ROLE_META[role] ?? ROLE_META.student
  const RoleIcon = meta.icon
  const navItems = NAV_ITEMS[role] ?? []

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <RoleIcon className="w-4.5 h-4.5 text-white" size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">EduAI</div>
            <div className={`text-xs font-medium ${meta.color} truncate`}>{meta.label} Portal</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm z-10 hover:bg-slate-50 transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft className={cn('w-3 h-3 text-slate-400 transition-transform', collapsed && 'rotate-180')} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutDashboard
          // Exact match for root dashboard routes, prefix match for sub-routes
          const isDashboardRoot = item.href === `/${role}`
          const isActive = isDashboardRoot
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'sidebar-link',
                isActive && 'active',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {user.firstName ? `${user.firstName[0]}${user.lastName?.[0] ?? ''}`.toUpperCase() : '??'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </motion.aside>
  )
}
