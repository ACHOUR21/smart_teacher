'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Sparkles, Video, ClipboardList,
  BarChart3, Users, MessageSquare, Settings, Bot, TrendingUp,
  Calendar, Clock, CreditCard, Shield, FileText, GraduationCap,
  Heart, LogOut, ChevronLeft, Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/constants'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, BookOpen, Sparkles, Video, ClipboardList,
  BarChart3, Users, MessageSquare, Settings, Bot, TrendingUp,
  Calendar, Clock, CreditCard, Shield, FileText,
}

const roleConfig: Record<Role, { label: string; color: string; gradient: string; icon: React.ElementType; nav: Array<{ label: string; href: string; icon: string }> }> = {
  teacher: {
    label: 'Teacher',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-400',
    icon: GraduationCap,
    nav: [
      { label: 'Dashboard', href: '/teacher', icon: 'LayoutDashboard' },
      { label: 'My Courses', href: '/teacher/courses', icon: 'BookOpen' },
      { label: 'AI Studio', href: '/teacher/ai-studio', icon: 'Sparkles' },
      { label: 'Live Classes', href: '/teacher/live', icon: 'Video' },
      { label: 'Assignments', href: '/teacher/assignments', icon: 'ClipboardList' },
      { label: 'Grades', href: '/teacher/grades', icon: 'BarChart3' },
      { label: 'Students', href: '/teacher/students', icon: 'Users' },
      { label: 'Messages', href: '/teacher/messages', icon: 'MessageSquare' },
      { label: 'Settings', href: '/teacher/settings', icon: 'Settings' },
    ],
  },
  student: {
    label: 'Student',
    color: 'text-violet-600',
    gradient: 'from-violet-500 to-purple-400',
    icon: BookOpen,
    nav: [
      { label: 'Dashboard', href: '/student', icon: 'LayoutDashboard' },
      { label: 'My Courses', href: '/student/courses', icon: 'BookOpen' },
      { label: 'AI Tutor', href: '/student/ai-tutor', icon: 'Bot' },
      { label: 'Live Classes', href: '/student/live', icon: 'Video' },
      { label: 'Assignments', href: '/student/assignments', icon: 'ClipboardList' },
      { label: 'Grades', href: '/student/grades', icon: 'BarChart3' },
      { label: 'Progress', href: '/student/progress', icon: 'TrendingUp' },
      { label: 'Messages', href: '/student/messages', icon: 'MessageSquare' },
      { label: 'Settings', href: '/student/settings', icon: 'Settings' },
    ],
  },
  parent: {
    label: 'Parent',
    color: 'text-rose-600',
    gradient: 'from-rose-500 to-pink-400',
    icon: Heart,
    nav: [
      { label: 'Overview', href: '/parent', icon: 'LayoutDashboard' },
      { label: 'Children', href: '/parent/children', icon: 'Users' },
      { label: 'Attendance', href: '/parent/attendance', icon: 'Calendar' },
      { label: 'Grades', href: '/parent/grades', icon: 'BarChart3' },
      { label: 'Schedule', href: '/parent/schedule', icon: 'Clock' },
      { label: 'Messages', href: '/parent/messages', icon: 'MessageSquare' },
      { label: 'Payments', href: '/parent/payments', icon: 'CreditCard' },
      { label: 'Settings', href: '/parent/settings', icon: 'Settings' },
    ],
  },
  admin: {
    label: 'Admin',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-400',
    icon: Shield,
    nav: [
      { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
      { label: 'Users', href: '/admin/users', icon: 'Users' },
      { label: 'Courses', href: '/admin/courses', icon: 'BookOpen' },
      { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: 'CreditCard' },
      { label: 'Reports', href: '/admin/reports', icon: 'FileText' },
      { label: 'Security', href: '/admin/security', icon: 'Shield' },
      { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
    ],
  },
}

interface SidebarProps {
  role: Role
  user?: { name: string; email: string }
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ role, user, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const config = roleConfig[role]
  const RoleIcon = config.icon

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <RoleIcon className="w-4.5 h-4.5 text-white" size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">EduAI</div>
            <div className={`text-xs font-medium ${config.color} truncate`}>{config.label} Portal</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm z-10 hover:bg-slate-50 transition-colors"
      >
        <ChevronLeft className={cn('w-3 h-3 text-slate-400 transition-transform', collapsed && 'rotate-180')} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto scrollbar-hide">
        {config.nav.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard
          const isActive = pathname === item.href
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
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
        )}
        <button
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
