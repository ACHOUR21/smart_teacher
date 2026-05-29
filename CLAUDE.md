# EduAI Platform — Developer Guide

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url> && cd edu
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY (optional)

# 3. Start infrastructure
docker compose up -d postgres redis

# 4. Setup database
npm run db:generate
npm run db:push
npm run db:seed        # seeds demo users (password: Password123!)

# 5. Run dev servers
npm run dev            # starts both api (4000) and web (3000)
```

## Demo Accounts (after seeding)

| Role    | Email                     | Password      |
|---------|---------------------------|---------------|
| Admin   | admin@eduai.com           | Password123!  |
| Teacher | sarah.johnson@teacher.edu | Password123!  |
| Student | amir.hassan@student.edu   | Password123!  |
| Parent  | fatima.hassan@parent.edu  | Password123!  |

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | Next.js 15, React 18, Tailwind CSS, Framer Motion |
| UI        | Radix UI, Recharts, Lucide Icons, sonner        |
| Forms     | React Hook Form + Zod                           |
| Auth      | JWT (15m access + 7d refresh UUID)              |
| Backend   | NestJS 10, Prisma ORM, PostgreSQL               |
| AI        | Anthropic Claude (primary), OpenAI (fallback)   |
| Realtime  | Socket.IO                                       |
| Email     | Nodemailer (SMTP)                               |
| Cache     | In-memory `AppCacheModule` (Map + TTL); Redis optional |
| Deploy    | Docker Compose                                  |

## Monorepo Structure

```
/
├── apps/
│   └── web/                    # Next.js 15 app
│       └── src/
│           ├── app/
│           │   ├── (auth)/     # login, register, forgot-password, reset-password
│           │   ├── (dashboard)/ # role-gated dashboards
│           │   │   ├── teacher/
│           │   │   ├── student/
│           │   │   ├── parent/
│           │   │   └── admin/
│           │   ├── onboarding/
│           │   ├── search/     # global search
│           │   └── page.tsx    # landing
│           ├── components/
│           │   ├── landing/
│           │   ├── layout/     # sidebar, header, mobile-sidebar, notifications
│           │   └── dashboard/
│           └── lib/
│               ├── api.ts          # Axios client + all API namespaces
│               ├── auth-context.tsx # AuthProvider / useAuth
│               ├── socket.ts        # Socket.IO client
│               ├── use-notifications.ts # real-time notifications hook
│               ├── constants.ts     # NAV_ITEMS, ROLE_REDIRECTS
│               └── i18n/           # en, ar, fr translations
├── backend/
│   └── api/                    # NestJS app
│       └── src/
│           ├── auth/           # JWT, Passport, guards, decorators
│           ├── users/
│           ├── courses/        # lesson completion, progress tracking
│           ├── assignments/
│           ├── live-sessions/
│           ├── notifications/
│           ├── ai/             # Claude/OpenAI/mock LLM service
│           ├── analytics/      # role-specific analytics (teacher/student/admin)
│           ├── messages/       # 1-to-1 conversations + real-time
│           ├── search/         # cross-entity search with cache
│           ├── cache/          # AppCacheModule (global, in-memory)
│           ├── email/          # Nodemailer templates
│           ├── websocket/      # Socket.IO gateway
│           └── prisma/
├── packages/
│   ├── database/
│   │   └── prisma/
│   │       ├── schema.prisma   # 30+ models
│   │       └── seed.ts         # demo data
│   └── shared-types/
└── docker-compose.yml
```

## Route Table

### Auth Routes
| Path                  | Description         |
|-----------------------|---------------------|
| `/login`              | Sign in             |
| `/register`           | Create account      |
| `/forgot-password`    | Request reset email |
| `/reset-password`     | Set new password    |
| `/onboarding`         | Post-register setup |

### Teacher Routes
| Path                              | Description              |
|-----------------------------------|---------------------------|
| `/teacher`                        | Dashboard overview        |
| `/teacher/courses`                | Course list               |
| `/teacher/courses/new`            | 4-step course wizard      |
| `/teacher/courses/[id]`           | Course editor (chapters)  |
| `/teacher/assignments`            | Assignment list           |
| `/teacher/assignments/[id]`       | Grade submissions         |
| `/teacher/students`               | Student roster            |
| `/teacher/students/[id]`          | Student analytics detail  |
| `/teacher/grades`                 | Grade book                |
| `/teacher/live`                   | Live sessions             |
| `/teacher/ai-studio`              | AI content generator      |
| `/teacher/messages`               | Messaging (real-time)     |
| `/teacher/analytics`              | Teaching analytics        |
| `/teacher/settings`               | Settings                  |

### Student Routes
| Path                              | Description              |
|-----------------------------------|---------------------------|
| `/student`                        | Dashboard overview        |
| `/student/courses`                | Browse & enrolled         |
| `/student/courses/[id]`           | Course viewer             |
| `/student/assignments`            | Assignment list           |
| `/student/assignments/[id]`       | Take assignment           |
| `/student/ai-tutor`               | AI chat tutor             |
| `/student/progress`               | Progress analytics        |
| `/student/grades`                 | Grade book                |
| `/student/live`                   | Live sessions             |
| `/student/messages`               | Messaging (real-time)     |
| `/student/profile/[id]`           | Public profile            |
| `/student/settings`               | Settings                  |

### Parent Routes
| Path                              | Description              |
|-----------------------------------|---------------------------|
| `/parent`                         | Dashboard overview        |
| `/parent/children`                | Children overview         |
| `/parent/children/add`            | Link a child account      |
| `/parent/grades`                  | Children's grades         |
| `/parent/attendance`              | Attendance records        |
| `/parent/schedule`                | Weekly schedule           |
| `/parent/payments`                | Subscription & invoices   |
| `/parent/messages`                | Message teachers          |
| `/parent/settings`                | Settings                  |

### Admin Routes
| Path                              | Description              |
|-----------------------------------|---------------------------|
| `/admin`                          | Dashboard overview        |
| `/admin/users`                    | User management           |
| `/admin/users/[id]`               | User detail & edit        |
| `/admin/courses`                  | Course management         |
| `/admin/content`                  | Content moderation        |
| `/admin/analytics`                | Platform analytics        |
| `/admin/subscriptions`            | Subscription management   |
| `/admin/reports`                  | Reports                   |
| `/admin/security`                 | Security & audit log      |
| `/admin/settings`                 | Platform settings         |

### Shared
| Path         | Description           |
|--------------|-----------------------|
| `/search`    | Global search         |
| `/`          | Landing page          |

## API Endpoints

### Auth
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

### Users
```
GET    /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
PATCH  /api/v1/users/:id/status
GET    /api/v1/users/stats
```

### Courses & Lessons
```
GET    /api/v1/courses
GET    /api/v1/courses/:id
POST   /api/v1/courses
PATCH  /api/v1/courses/:id
POST   /api/v1/courses/:id/enroll
GET    /api/v1/courses/my-enrollments
GET    /api/v1/courses/my-courses
POST   /api/v1/courses/:courseId/lessons/:lessonId/complete   # mark lesson done (student)
GET    /api/v1/courses/:courseId/progress                     # % complete (student)
```

### Assignments
```
GET    /api/v1/assignments
GET    /api/v1/assignments/:id
POST   /api/v1/assignments
POST   /api/v1/assignments/:id/submit
GET    /api/v1/assignments/:id/submissions
PATCH  /api/v1/assignments/:id/submissions/:sid/grade
GET    /api/v1/assignments/my-assignments
```

### Live Sessions
```
GET    /api/v1/live-sessions
GET    /api/v1/live-sessions/:id
POST   /api/v1/live-sessions
PATCH  /api/v1/live-sessions/:id/start
PATCH  /api/v1/live-sessions/:id/end
POST   /api/v1/live-sessions/:id/join
```

### Notifications
```
GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/mark-all-read
POST   /api/v1/notifications
```

### AI
```
POST   /api/v1/ai/sessions
GET    /api/v1/ai/sessions
GET    /api/v1/ai/sessions/:id
POST   /api/v1/ai/sessions/:id/chat
POST   /api/v1/ai/generate/lesson
POST   /api/v1/ai/generate/quiz
POST   /api/v1/ai/generate/summary
POST   /api/v1/ai/generate/mindmap
```

### Analytics  _(role-guarded)_
```
GET    /api/v1/analytics/teacher   # TEACHER only
GET    /api/v1/analytics/student   # STUDENT only
GET    /api/v1/analytics/admin     # ADMIN only
```

Teacher response fields: `totalStudents`, `totalSubmissions`, `avgScore`, `liveSessions`, `courses[]`, `gradeBuckets`, `submissionTrend[]`
Student response fields: `enrollments`, `completedLessons`, `gradedSubmissions`, `avgScore`, `recentScores[]`
Admin response fields: `totalUsers`, `publishedCourses`, `recentEnrollments`, `aiSessions`, `trend[]`, `roleBreakdown`, `courseBreakdown`

### Messages
```
GET    /api/v1/messages/conversations              # list user's conversations
POST   /api/v1/messages/conversations              # body: { userId } — getOrCreate
GET    /api/v1/messages/conversations/:id          # get messages (query: limit, before)
POST   /api/v1/messages/conversations/:id/messages # body: { content }
```

### Search
```
GET    /api/v1/search?q=<query>&type=<courses|users|assignments>   # 15s cached
```

### Misc
```
GET    /health
GET    /docs   (Swagger UI)
```

## WebSocket Events

Connect to `ws://localhost:4000/realtime` with `?token=<accessToken>`.

| Event (client → server) | Payload                       |
|-------------------------|-------------------------------|
| `join-session`          | `{ sessionId }`               |
| `leave-session`         | `{ sessionId }`               |
| `chat-message`          | `{ sessionId, content }`      |
| `raise-hand`            | `{ sessionId }`               |

| Event (server → client) | Payload                             |
|-------------------------|-------------------------------------|
| `notification`          | Notification object                 |
| `chat-message`          | Message object + `conversationId`   |
| `hand-raised`           | `{ userId, sessionId }`             |
| `session-started`       | `{ sessionId }`                     |
| `session-ended`         | `{ sessionId }`                     |

## Caching

The backend uses an in-memory `AppCacheModule` (`@Global()`) with a `CacheService`:

```typescript
cache.wrap('key', () => fetchFromDB(), ttlMs)   // cache-aside pattern
cache.del('key')                                // invalidate single key
cache.delByPrefix('courses:list')               // invalidate by prefix
```

Default TTLs: courses list 30s, course detail 60s, analytics 2–5 min, search 15s.

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://edu:edu@localhost:5432/eduai
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=another-secret-here

# AI (optional — falls back to mock)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Email (optional — logs only if not set)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
SMTP_FROM="EduAI" <no-reply@eduai.com>

# App
PORT=4000
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:4000

# Payments (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## i18n

Translations live in `apps/web/src/lib/i18n/{en,ar,fr}.ts`.
Arabic (`ar`) is RTL — the `getDir()` helper returns `'rtl'`.
Locale switching is wired through `<html lang dir>` in the root layout.

## Prisma Commands

```bash
npm run db:generate   # generates Prisma client
npm run db:push       # pushes schema to DB (dev)
npm run db:migrate    # creates migration file (prod)
npm run db:seed       # seeds demo data
npm run db:studio     # opens Prisma Studio at :5555
```
