import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CoursesModule } from './courses/courses.module'
import { AssignmentsModule } from './assignments/assignments.module'
import { LiveSessionsModule } from './live-sessions/live-sessions.module'
import { NotificationsModule } from './notifications/notifications.module'
import { AIModule } from './ai/ai.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    AssignmentsModule,
    LiveSessionsModule,
    NotificationsModule,
    AIModule,
  ],
})
export class AppModule {}
