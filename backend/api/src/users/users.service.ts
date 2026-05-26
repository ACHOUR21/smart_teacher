import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { role?: string; search?: string; limit?: number; offset?: number }) {
    const where: any = {};
    if (params.role) where.role = params.role.toUpperCase();
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isActive: true, createdAt: true, avatarUrl: true,
        },
        take: params.limit ?? 20,
        skip: params.offset ?? 0,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, limit: params.limit ?? 20, offset: params.offset ?? 0 };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, createdAt: true, avatarUrl: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: { firstName?: string; lastName?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, createdAt: true, avatarUrl: true,
      },
    });
  }

  async setActive(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });
  }

  async getStats() {
    const [total, students, teachers, parents, activeToday] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
      this.prisma.user.count({ where: { role: 'PARENT' } }),
      this.prisma.user.count({
        where: { updatedAt: { gte: new Date(Date.now() - 86400000) } },
      }),
    ]);
    return { total, students, teachers, parents, activeToday };
  }
}
