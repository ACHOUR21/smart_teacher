export interface AuthUser {
  id: string;
  sub: string;
  email: string;
  role: string;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
}
