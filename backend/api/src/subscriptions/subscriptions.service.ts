import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PLAN_MRR: Record<string, number> = { Free: 0, Pro: 29, Institution: 200 };

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const subs = await this.prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Manual join — Subscription has no Prisma relation to User
    const userIds = [...new Set(subs.map((s) => s.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const data = subs.map((s) => ({ ...s, user: userMap[s.userId] ?? null }));

    const byPlan = subs.reduce(
      (acc, s) => { acc[s.plan] = (acc[s.plan] || 0) + 1; return acc; },
      {} as Record<string, number>,
    );

    const estimatedMRR = subs
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + (PLAN_MRR[s.plan] ?? 0), 0);

    const activeCount = subs.filter((s) => s.status === 'active').length;

    return { data, total: subs.length, byPlan, estimatedMRR, activeCount };
  }

  async getMy(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }
}
