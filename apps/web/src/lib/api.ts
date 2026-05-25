import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from localStorage
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track in-progress refresh to prevent race conditions
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise(resolve => {
          refreshQueue.push(token => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        refreshQueue.forEach(cb => cb(data.accessToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (dto: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', dto),
  login: (dto: { email: string; password: string }) =>
    api.post('/auth/login', dto),
  logout: (dto: { refreshToken: string }) =>
    api.post('/auth/logout', dto),
  refresh: (dto: { refreshToken: string }) =>
    api.post('/auth/refresh', dto),
  getMe: () =>
    api.get('/auth/me'),
};

export const coursesApi = {
  list: (params?: Record<string, unknown>) => api.get('/courses', { params }),
  get: (id: string) => api.get(`/courses/${id}`),
  create: (dto: Record<string, unknown>) => api.post('/courses', dto),
  update: (id: string, dto: Record<string, unknown>) => api.patch(`/courses/${id}`, dto),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
  myEnrollments: () => api.get('/courses/my-enrollments'),
  myCourses: () => api.get('/courses/my-courses'),
};

export const usersApi = {
  me: () => api.get('/users/me'),
  updateProfile: (dto: Record<string, unknown>) => api.patch('/users/me', dto),
  myStats: () => api.get('/users/me/stats'),
  list: (params?: Record<string, unknown>) => api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  setStatus: (id: string, isActive: boolean) => api.patch(`/users/${id}/status`, { isActive }),
};

export const aiApi = {
  createSession: (dto: { title?: string; courseId?: string }) =>
    api.post('/ai/sessions', dto),
  getSessions: () => api.get('/ai/sessions'),
  getSession: (id: string) => api.get(`/ai/sessions/${id}`),
  chat: (id: string, dto: { message: string }) =>
    api.post(`/ai/sessions/${id}/chat`, dto),
  generateLesson: (dto: Record<string, unknown>) => api.post('/ai/generate/lesson', dto),
  generateQuiz: (dto: Record<string, unknown>) => api.post('/ai/generate/quiz', dto),
  generateSummary: (content: string) => api.post('/ai/generate/summary', { content }),
  generateMindMap: (topic: string) => api.post('/ai/generate/mindmap', { topic }),
};

export const assignmentsApi = {
  list: (params?: Record<string, unknown>) => api.get('/assignments', { params }),
  mine: () => api.get('/assignments/mine'),
  get: (id: string) => api.get(`/assignments/${id}`),
  create: (dto: Record<string, unknown>) => api.post('/assignments', dto),
  submit: (id: string, answers: Record<string, string>) =>
    api.post(`/assignments/${id}/submit`, { answers }),
  getSubmissions: (id: string) => api.get(`/assignments/${id}/submissions`),
  gradeSubmission: (submId: string, score: number, feedback?: string) =>
    api.patch(`/assignments/submissions/${submId}/grade`, { score, feedback }),
};

export const liveApi = {
  list: (params?: Record<string, unknown>) => api.get('/live-sessions', { params }),
  create: (dto: Record<string, unknown>) => api.post('/live-sessions', dto),
  start: (id: string) => api.patch(`/live-sessions/${id}/start`),
  end: (id: string) => api.patch(`/live-sessions/${id}/end`),
  join: (id: string) => api.post(`/live-sessions/${id}/join`),
};

export const notificationsApi = {
  list: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
