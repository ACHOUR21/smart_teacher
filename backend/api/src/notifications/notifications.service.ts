import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getForUser(userId: string, params?: { limit?: number; offset?: number }) {
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: params?.limit ?? 20,
        skip: params?.offset ?? 0,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { data, total, limit: params?.limit ?? 20, offset: params?.offset ?? 0 };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(data: {
    userId: string;
    title: string;
    body: string;
    type: string;
    data?: Record<string, unknown>;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type,
        data: (data.data ?? {}) as any,
      },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.notification.deleteMany({ where: { id, userId } });
  }
}
