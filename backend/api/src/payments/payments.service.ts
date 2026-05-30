import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getMyPayments(userId: string) {
    const parent = await this.prisma.parent.findUnique({ where: { userId } });
    if (!parent) return [];
    return this.prisma.payment.findMany({
      where: { parentId: parent.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAll(limit = 100, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({ orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
      this.prisma.payment.count(),
    ]);
    return { data, total };
  }
}
