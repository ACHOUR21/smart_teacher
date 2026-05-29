import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppCacheModule } from './cache/cache.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { LiveSessionsModule } from './live-sessions/live-sessions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AIModule } from './ai/ai.module';
import { WebsocketModule } from './websocket/websocket.module';
import { EmailModule } from './email/email.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AppCacheModule,
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    AssignmentsModule,
    LiveSessionsModule,
    NotificationsModule,
    AIModule,
    WebsocketModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
