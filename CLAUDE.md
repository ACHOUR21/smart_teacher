# EduAI Platform

AI-powered educational platform with teacher, student, parent, and admin dashboards.

## Monorepo Structure

```
.
├── apps/
│   └── web/                   # Next.js 15 frontend (port 3000)
├── backend/
│   └── api/                   # NestJS API (port 4000)
├── packages/
│   ├── database/              # Prisma schema & client
│   ├── shared-types/          # TypeScript type definitions
│   └── ui/                    # Shared React components
├── docker-compose.yml
└── turbo.json
```

## Quick Start

```bash
# 1. Copy env file and fill in secrets
cp .env.example .env

# 2. Start all infrastructure (Postgres + Redis)
docker compose up postgres redis -d

# 3. Generate Prisma client and push schema
npm run db:generate
npm run db:push

# 4. Start all apps in dev mode
npm run dev
```

Frontend: http://localhost:3000  
API: http://localhost:4000/api/v1  
Swagger: http://localhost:4000/docs

## Environment Variables

See `.env.example` for the full list. Critical vars:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis URL for caching |
| `JWT_SECRET` | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) |
| `ANTHROPIC_API_KEY` | Claude API key for AI features |
| `NEXTAUTH_SECRET` | Next.js auth secret |

## Tech Stack

### Frontend (`apps/web`)
- **Next.js 15** with App Router
- **Tailwind CSS** with custom design tokens
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Radix UI** for accessible primitives
- **React Hook Form + Zod** for form validation
- **socket.io-client** for real-time updates

### Backend (`backend/api`)
- **NestJS 10** with modular architecture
- **Prisma ORM** with PostgreSQL
- **Passport JWT** with refresh token rotation
- **Socket.IO** WebSocket gateway
- **Anthropic Claude** (claude-sonnet-4-6) + OpenAI GPT-4o as fallback
- **Swagger/OpenAPI** auto-generated docs

## Dashboard Routes

| Role | Base Route | Key Sub-pages |
|---|---|---|
| Teacher | `/teacher` | courses, ai-studio, live, assignments, grades, students, messages, settings |
| Student | `/student` | courses, ai-tutor, live, assignments, grades, progress, messages, settings |
| Parent | `/parent` | children, attendance, grades, schedule, messages, payments, settings |
| Admin | `/admin` | users, courses, analytics, subscriptions, reports, security, settings |

## API Modules

| Module | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Users | `GET /users/me`, `PATCH /users/me`, `GET /users` (admin) |
| Courses | `GET /courses`, `POST /courses`, `GET /courses/:id`, `POST /courses/:id/enroll` |
| Assignments | `GET /assignments`, `POST /assignments`, `POST /assignments/:id/submit`, `PATCH /assignments/submissions/:id/grade` |
| Live Sessions | `GET /live-sessions`, `POST /live-sessions`, `PATCH /live-sessions/:id/start`, `POST /live-sessions/:id/join` |
| AI | `POST /ai/sessions`, `POST /ai/sessions/:id/chat`, `POST /ai/generate/lesson` |
| Notifications | `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/read-all` |

## WebSocket Events

Namespace: `/realtime`

| Event | Direction | Payload |
|---|---|---|
| `join-session` | Client → Server | `{ sessionId }` |
| `leave-session` | Client → Server | `{ sessionId }` |
| `chat-message` | Client → Server | `{ sessionId, message }` |
| `raise-hand` | Client → Server | `{ sessionId }` |
| `notification` | Server → Client | `{ type, title, body }` |

## Docker (Production)

```bash
docker compose up --build
```

All services: PostgreSQL, Redis, NestJS API, Next.js Web.

## Database

```bash
# Run migrations
npx prisma migrate dev --name <description>

# Open Prisma Studio
npx prisma studio

# Seed (if seed script added)
npx prisma db seed
```

## Testing

```bash
# Frontend type check
cd apps/web && npx tsc --noEmit

# Backend unit tests
cd backend/api && npm test

# Backend e2e
cd backend/api && npm run test:e2e
```
