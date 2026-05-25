import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    page = 1,
    limit = 20,
    role,
    search,
  }: {
    page?: number;
    limit?: number;
    role?: Role;
    search?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        teacher: true,
        student: true,
        parent: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, dto: { name?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async setActive(id: string, isActive: boolean, requesterId: string) {
    if (id === requesterId) throw new ForbiddenException('Cannot change your own status');
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });
  }

  async getStats(userId: string, role: Role) {
    if (role === 'TEACHER') {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
      if (!teacher) return {};
      const [courseCount, studentCount] = await Promise.all([
        this.prisma.course.count({ where: { teacherId: teacher.id } }),
        this.prisma.enrollment.count({ where: { course: { teacherId: teacher.id } } }),
      ]);
      return { courseCount, studentCount };
    }
    if (role === 'STUDENT') {
      const student = await this.prisma.student.findUnique({ where: { userId } });
      if (!student) return {};
      const enrollments = await this.prisma.enrollment.count({ where: { studentId: student.id } });
      return { enrollments };
    }
    return {};
  }
}
