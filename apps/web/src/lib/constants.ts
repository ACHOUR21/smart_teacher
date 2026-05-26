export const ROLES = ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_REDIRECTS: Record<string, string> = {
  student: '/student',
  teacher: '/teacher',
  parent: '/parent',
  admin: '/admin',
};

export const NAV_ITEMS: Record<string, { href: string; label: string; icon: string }[]> = {
  teacher: [
    { href: '/teacher', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/teacher/courses', label: 'Courses', icon: 'BookOpen' },
    { href: '/teacher/assignments', label: 'Assignments', icon: 'ClipboardList' },
    { href: '/teacher/students', label: 'Students', icon: 'Users' },
    { href: '/teacher/grades', label: 'Grades', icon: 'BarChart2' },
    { href: '/teacher/live', label: 'Live Classes', icon: 'Video' },
    { href: '/teacher/schedule', label: 'Schedule', icon: 'Calendar' },
    { href: '/teacher/ai-studio', label: 'AI Studio', icon: 'Cpu' },
    { href: '/teacher/messages', label: 'Messages', icon: 'MessageCircle' },
    { href: '/teacher/settings', label: 'Settings', icon: 'Settings' },
  ],
  student: [
    { href: '/student', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/student/courses', label: 'Courses', icon: 'BookOpen' },
    { href: '/student/assignments', label: 'Assignments', icon: 'ClipboardList' },
    { href: '/student/ai-tutor', label: 'AI Tutor', icon: 'Cpu' },
    { href: '/student/progress', label: 'Progress', icon: 'BarChart2' },
    { href: '/student/grades', label: 'Grades', icon: 'Star' },
    { href: '/student/live', label: 'Live Classes', icon: 'Video' },
    { href: '/student/messages', label: 'Messages', icon: 'MessageCircle' },
    { href: '/student/settings', label: 'Settings', icon: 'Settings' },
  ],
  parent: [
    { href: '/parent', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/parent/children', label: 'My Children', icon: 'Users' },
    { href: '/parent/grades', label: 'Grades', icon: 'BarChart2' },
    { href: '/parent/attendance', label: 'Attendance', icon: 'UserCheck' },
    { href: '/parent/schedule', label: 'Schedule', icon: 'Calendar' },
    { href: '/parent/payments', label: 'Payments', icon: 'CreditCard' },
    { href: '/parent/messages', label: 'Messages', icon: 'MessageCircle' },
    { href: '/parent/settings', label: 'Settings', icon: 'Settings' },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/admin/users', label: 'Users', icon: 'Users' },
    { href: '/admin/courses', label: 'Courses', icon: 'BookOpen' },
    { href: '/admin/content', label: 'Content', icon: 'FileText' },
    { href: '/admin/analytics', label: 'Analytics', icon: 'BarChart2' },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: 'CreditCard' },
    { href: '/admin/reports', label: 'Reports', icon: 'FileText' },
    { href: '/admin/security', label: 'Security', icon: 'Shield' },
    { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
  ],
};
