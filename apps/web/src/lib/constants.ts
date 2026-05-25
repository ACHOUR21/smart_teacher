export const APP_NAME = 'EduAI'

export const ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  ADMIN: 'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_REDIRECTS: Record<Role, string> = {
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
  admin: '/admin',
}

export const NAV_ITEMS = {
  teacher: [
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
  student: [
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
  parent: [
    { label: 'Overview', href: '/parent', icon: 'LayoutDashboard' },
    { label: 'Children', href: '/parent/children', icon: 'Users' },
    { label: 'Attendance', href: '/parent/attendance', icon: 'Calendar' },
    { label: 'Grades', href: '/parent/grades', icon: 'BarChart3' },
    { label: 'Schedule', href: '/parent/schedule', icon: 'Clock' },
    { label: 'Messages', href: '/parent/messages', icon: 'MessageSquare' },
    { label: 'Payments', href: '/parent/payments', icon: 'CreditCard' },
    { label: 'Settings', href: '/parent/settings', icon: 'Settings' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { label: 'Users', href: '/admin/users', icon: 'Users' },
    { label: 'Courses', href: '/admin/courses', icon: 'BookOpen' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: 'CreditCard' },
    { label: 'Reports', href: '/admin/reports', icon: 'FileText' },
    { label: 'Security', href: '/admin/security', icon: 'Shield' },
    { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
  ],
}
