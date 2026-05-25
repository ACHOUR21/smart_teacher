# EduAI Platform

Enterprise-grade AI-powered educational platform — monorepo built with Next.js 15, NestJS, Prisma/PostgreSQL, and Docker.

## Architecture

```
edu-platform/
├── apps/
│   └── web/              # Next.js 15 (landing + 4 dashboards)
├── packages/
│   ├── database/         # Prisma ORM + PostgreSQL schema
│   └── shared-types/     # TypeScript types shared across apps
├── backend/
│   └── api/              # NestJS REST API
├── docker-compose.yml
└── turbo.json
```

## Tech Stack

| Layer | Technology |
|---|---|
| Web frontend | Next.js 15, React 18, TypeScript, Tailwind CSS, Framer Motion |
| Component library | Radix UI primitives, Lucide icons, Recharts |
| State / forms | React Hook Form + Zod |
| Backend API | NestJS 10, Passport JWT, class-validator |
| Database | PostgreSQL 16 + Prisma ORM |
| Cache / Queue | Redis 7 |
| Monorepo | Turborepo |
| Containers | Docker + Docker Compose |

## User Roles

| Role | Dashboard route | Key features |
|---|---|---|
| Teacher | `/teacher` | AI studio, course builder, live classes, grading |
| Student | `/student` | AI tutor, courses, progress, assignments |
| Parent | `/parent` | Children monitoring, grades, attendance, alerts |
| Admin | `/admin` | User management, analytics, security, settings |

## Quick Start

### Prerequisites
- Node.js ≥ 20
- Docker + Docker Compose

### 1. Clone & install
```bash
git clone <repo>
cd edu-platform
cp .env.example .env   # fill in your secrets
npm install
```

### 2. Start infrastructure
```bash
docker compose up postgres redis -d
```

### 3. Migrate database
```bash
npm run db:generate
npm run db:push
```

### 4. Run everything
```bash
npm run dev
# web  → http://localhost:3000
# api  → http://localhost:4000
# docs → http://localhost:4000/docs
```

### Production (Docker)
```bash
docker compose up --build
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | public | Register |
| POST | `/api/v1/auth/login` | public | Login |
| POST | `/api/v1/auth/refresh` | public | Refresh token |
| POST | `/api/v1/auth/logout` | JWT | Logout |
| GET | `/api/v1/auth/me` | JWT | Get current user |
| GET | `/api/v1/users` | ADMIN | List users |
| GET | `/api/v1/courses` | JWT | List courses |
| POST | `/api/v1/courses` | TEACHER | Create course |
| GET | `/api/v1/courses/my/teacher` | TEACHER | My courses |
| GET | `/api/v1/courses/my/student` | STUDENT | Enrolled courses |
| POST | `/api/v1/courses/:id/enroll` | STUDENT | Enroll |

Full interactive docs available at `/docs` (Swagger UI).

## Database Schema

The Prisma schema covers:
- **Users** (all roles) with OAuth, 2FA, device sessions
- **Schools / Subscriptions / Payments** (Stripe-ready)
- **Courses / Chapters / Lessons / Resources**
- **Assignments / Questions / Submissions** (auto-grading-ready)
- **Live Sessions / Attendance**
- **Conversations / Messages**
- **Notifications**
- **AI Sessions / Messages** (token tracking)
- **Audit Logs**

## Pages

| Route | Description |
|---|---|
| `/` | Landing page (hero, features, AI showcase, pricing, testimonials) |
| `/login` | Email/password + Google/Apple social login |
| `/register` | Role-picker + signup form |
| `/forgot-password` | Email reset flow |
| `/teacher` | Teacher dashboard |
| `/student` | Student dashboard |
| `/parent` | Parent overview |
| `/admin` | Admin dashboard |

## What’s next

Priority order for next sprints:
1. **Wire auth to backend** — replace the stub `onSubmit` in login/register with real API calls
2. **AI Tutor** — `/student/ai-tutor` chat UI connected to OpenAI/Claude via the backend `ai` module
3. **Course builder** — `/teacher/courses/new` with chapter/lesson CRUD
4. **Live classes** — WebRTC via Socket.IO in the backend `websocket` service
5. **Assignments module** — complete the `AssignmentsModule` in the backend
6. **Notifications** — real-time via Socket.IO + push via FCM
7. **Mobile app** — Flutter or React Native consuming the same API

## Environment Variables

See `.env.example` for the full list. Critical ones:

```
DATABASE_URL         PostgreSQL connection string
JWT_SECRET           Min 32 random chars
JWT_REFRESH_SECRET   Min 32 random chars (different from above)
NEXTAUTH_SECRET      Min 32 random chars
OPENAI_API_KEY       For AI tutor and lesson generation
ANTHROPIC_API_KEY    For Claude-powered features
```

## License

Proprietary — your company.
