// Auth
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// User
export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// Course
export interface CourseDTO {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  category?: string;
  difficulty?: string;
  isPublished: boolean;
  teacher?: { id: string; user: { firstName: string; lastName: string } };
  enrolledCount?: number;
  chapters?: ChapterDTO[];
}

export interface ChapterDTO {
  id: string;
  title: string;
  order: number;
  lessons?: LessonDTO[];
}

export interface LessonDTO {
  id: string;
  title: string;
  type: string;
  durationMins?: number;
  order: number;
  isCompleted?: boolean;
}

// Assignments
export interface AssignmentDTO {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  totalPoints: number;
  courseId: string;
  course?: { title: string };
  submissionsCount?: number;
}

export interface SubmissionDTO {
  id: string;
  assignmentId: string;
  studentId: string;
  status: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
}

// Live Sessions
export interface LiveSessionDTO {
  id: string;
  title: string;
  courseId: string;
  course?: { title: string };
  teacherId: string;
  status: string;
  startedAt?: string;
  endedAt?: string;
  roomId: string;
}

// Notifications
export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// AI
export interface AISessionDTO {
  id: string;
  userId: string;
  title: string;
  messages?: AIMessageDTO[];
  createdAt: string;
}

export interface AIMessageDTO {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

// Generic Wrappers
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Stats
export interface TeacherStats {
  totalStudents: number;
  totalCourses: number;
  pendingAssignments: number;
  avgGrade: number;
}

export interface StudentStats {
  enrolledCourses: number;
  completedAssignments: number;
  averageGrade: number;
  streak: number;
}
