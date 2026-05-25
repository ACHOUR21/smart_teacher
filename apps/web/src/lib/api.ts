import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('edu_access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error)

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('edu_refresh_token')
      const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken })
      localStorage.setItem('edu_access_token', data.accessToken)
      localStorage.setItem('edu_refresh_token', data.refreshToken)
      refreshQueue.forEach((cb) => cb(data.accessToken))
      refreshQueue = []
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return api(original)
    } catch {
      localStorage.removeItem('edu_access_token')
      localStorage.removeItem('edu_refresh_token')
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

// ─── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then((r) => r.data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
}

// ─── Courses ────────────────────────────────────────────────────────────────

export const coursesApi = {
  list: (params?: Record<string, any>) => api.get('/courses', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/courses/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/courses', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/courses/${id}`, data).then((r) => r.data),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`).then((r) => r.data),
  myTeacher: () => api.get('/courses/my/teacher').then((r) => r.data),
  myStudent: () => api.get('/courses/my/student').then((r) => r.data),
}

// ─── Users ─────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (params?: Record<string, any>) => api.get('/users', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  updateProfile: (data: any) => api.patch('/users/profile', data).then((r) => r.data),
}

// ─── AI ─────────────────────────────────────────────────────────────────────

export const aiApi = {
  createSession: (subject?: string) => api.post('/ai/sessions', { subject }).then((r) => r.data),
  getSessions: () => api.get('/ai/sessions').then((r) => r.data),
  getSession: (id: string) => api.get(`/ai/sessions/${id}`).then((r) => r.data),
  chat: (sessionId: string, message: string) =>
    api.post(`/ai/sessions/${sessionId}/chat`, { message }).then((r) => r.data),
  generateLesson: (data: { topic: string; grade: string; duration: number; language: string }) =>
    api.post('/ai/generate/lesson', data).then((r) => r.data),
  generateQuiz: (data: { topic: string; count: number; difficulty: string }) =>
    api.post('/ai/generate/quiz', data).then((r) => r.data),
  generateSummary: (text: string) =>
    api.post('/ai/generate/summary', { text }).then((r) => r.data),
  generateMindMap: (topic: string) =>
    api.post('/ai/generate/mindmap', { topic }).then((r) => r.data),
}

// ─── Assignments ───────────────────────────────────────────────────────────

export const assignmentsApi = {
  list: (params?: Record<string, any>) =>
    api.get('/assignments', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/assignments/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/assignments', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/assignments/${id}`, data).then((r) => r.data),
  submit: (id: string, answers: any) =>
    api.post(`/assignments/${id}/submit`, { answers }).then((r) => r.data),
  submissions: (id: string) =>
    api.get(`/assignments/${id}/submissions`).then((r) => r.data),
}

// ─── Live Sessions ───────────────────────────────────────────────────────────

export const liveApi = {
  list: (params?: Record<string, any>) =>
    api.get('/live-sessions', { params }).then((r) => r.data),
  create: (data: any) => api.post('/live-sessions', data).then((r) => r.data),
  join: (id: string) => api.post(`/live-sessions/${id}/join`).then((r) => r.data),
  end: (id: string) => api.post(`/live-sessions/${id}/end`).then((r) => r.data),
}

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
}
