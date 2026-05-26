import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const api = axios.create({ baseURL: API_BASE });

// Attach token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401: attempt refresh, queue concurrent requests
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        const newToken = data.accessToken;
        localStorage.setItem('accessToken', newToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
};

export const coursesApi = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getOne: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.patch(`/courses/${id}`, data),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
  getMyEnrollments: () => api.get('/courses/my-enrollments'),
  getMyTeacherCourses: () => api.get('/courses/my-courses'),
};

export const usersApi = {
  getAll: (params?: any) => api.get('/users', { params }),
  getOne: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  setActive: (id: string, isActive: boolean) =>
    api.patch(`/users/${id}/status`, { isActive }),
  getStats: () => api.get('/users/stats'),
};

export const assignmentsApi = {
  getAll: (params?: any) => api.get('/assignments', { params }),
  getOne: (id: string) => api.get(`/assignments/${id}`),
  create: (data: any) => api.post('/assignments', data),
  submit: (id: string, data: any) => api.post(`/assignments/${id}/submit`, data),
  getSubmissions: (id: string) => api.get(`/assignments/${id}/submissions`),
  gradeSubmission: (assignmentId: string, submissionId: string, data: any) =>
    api.patch(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
  getMyAssignments: () => api.get('/assignments/my-assignments'),
};

export const liveApi = {
  getSessions: (params?: any) => api.get('/live-sessions', { params }),
  getOne: (id: string) => api.get(`/live-sessions/${id}`),
  create: (data: any) => api.post('/live-sessions', data),
  start: (id: string) => api.patch(`/live-sessions/${id}/start`),
  end: (id: string) => api.patch(`/live-sessions/${id}/end`),
  join: (id: string) => api.post(`/live-sessions/${id}/join`),
};

export const notificationsApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  create: (data: any) => api.post('/notifications', data),
};

export const aiApi = {
  createSession: (data: any) => api.post('/ai/sessions', data),
  getSessions: () => api.get('/ai/sessions'),
  getSession: (id: string) => api.get(`/ai/sessions/${id}`),
  chat: (id: string, message: string) =>
    api.post(`/ai/sessions/${id}/chat`, { message }),
  generateLesson: (data: any) => api.post('/ai/generate/lesson', data),
  generateQuiz: (data: any) => api.post('/ai/generate/quiz', data),
  generateSummary: (data: any) => api.post('/ai/generate/summary', data),
  generateMindMap: (data: any) => api.post('/ai/generate/mindmap', data),
};
