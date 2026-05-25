// ─── Auth ─────────────────────────────────────────────────────────────────────

export type Role = 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'

export interface JwtPayload {
  sub: string
  email: string
  role: Role
  schoolId?: string
  iat?: number
  exp?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string
  email: string
  name: string
  avatar?: string
  role: Role
  locale: string
  timezone: string
  isActive: boolean
  createdAt: string
}

// ─── Course ───────────────────────────────────────────────────────────────────

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface CourseDTO {
  id: string
  title: string
  description?: string
  thumbnail?: string
  status: CourseStatus
  subject?: string
  grade?: string
  language: string
  teacherName: string
  enrollmentCount: number
  createdAt: string
  updatedAt: string
}

// ─── Assignment ───────────────────────────────────────────────────────────────

export type AssignmentType = 'homework' | 'quiz' | 'exam' | 'project'
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'
export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'LATE' | 'RESUBMIT'

export interface AssignmentDTO {
  id: string
  title: string
  description?: string
  type: AssignmentType
  maxScore: number
  dueAt?: string
  status: AssignmentStatus
  submissionCount: number
  totalStudents: number
  courseTitle: string
}

export interface SubmissionDTO {
  id: string
  studentName: string
  studentAvatar?: string
  status: SubmissionStatus
  score?: number
  submittedAt: string
  gradedAt?: string
}

// ─── Live Session ─────────────────────────────────────────────────────────────

export type SessionStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'

export interface LiveSessionDTO {
  id: string
  title: string
  courseTitle: string
  teacherName: string
  scheduledAt: string
  status: SessionStatus
  participantCount?: number
  recordingUrl?: string
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface PaginationQuery {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  statusCode: number
  message: string
  errors?: Record<string, string[]>
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = 'GRADE' | 'ATTENDANCE' | 'ASSIGNMENT' | 'ANNOUNCEMENT' | 'SYSTEM' | 'MESSAGE'

export interface NotificationDTO {
  id: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AISessionDTO {
  id: string
  subject?: string
  messageCount: number
  tokensUsed: number
  createdAt: string
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface TeacherStats {
  totalCourses: number
  totalStudents: number
  avgGrade: number
  aiSessionsUsed: number
  upcomingClasses: LiveSessionDTO[]
  pendingSubmissions: number
}

export interface StudentStats {
  enrolledCourses: number
  overallGrade: number
  streak: number
  xp: number
  level: number
  aiSessionsThisMonth: number
  pendingAssignments: number
}

export interface ParentStats {
  childrenCount: number
  avgGrade: number
  avgAttendance: number
  unreadNotifications: number
}

export interface AdminStats {
  totalUsers: number
  totalCourses: number
  monthlyRevenue: number
  platformUptime: number
  newUsersToday: number
}
