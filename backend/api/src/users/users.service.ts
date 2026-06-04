import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { role?: string; search?: string; limit?: number; offset?: number }) {
    const where: Prisma.UserWhereInput = {};
    if (params.role) where.role = params.role.toUpperCase() as Prisma.EnumRoleFilter['equals'];
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
        student: {
          select: {
            id: true, grade: true,
            _count: { select: { enrollments: true, submissions: true } },
            enrollments: {
              include: {
                course: {
                  select: { id: true, title: true, isPublished: true },
                },
              },
              take: 6,
              orderBy: { enrolledAt: 'desc' },
            },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findStudentsForParent(search: string, limit = 10) {
    const where: Prisma.UserWhereInput = { role: 'STUDENT' };
    if (search.trim()) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        student: { select: { id: true, grade: true } },
      },
      take: limit,
    });
    return users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      grade: u.student?.grade ?? '',
      studentId: u.student?.id,
    }));
  }

  async linkChild(parentUserId: string, studentUserId: string) {
    const [parent, student] = await Promise.all([
      this.prisma.parent.findUnique({ where: { userId: parentUserId } }),
      this.prisma.student.findUnique({ where: { userId: studentUserId } }),
    ]);
    if (!parent) throw new NotFoundException('Parent profile not found');
    if (!student) throw new NotFoundException('Student not found');

    const existing = await this.prisma.parentStudent.findUnique({
      where: { parentId_studentId: { parentId: parent.id, studentId: student.id } },
    });
    if (existing) throw new ConflictException('Student already linked');

    await this.prisma.parentStudent.create({
      data: { parentId: parent.id, studentId: student.id },
    });
    return { success: true };
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

  async getMyChildren(userId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      include: {
        children: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true, firstName: true, lastName: true,
                    avatarUrl: true, email: true,
                  },
                },
                enrollments: {
                  include: {
                    course: { select: { id: true, title: true, category: true } },
                  },
                },
                submissions: {
                  where: { status: 'GRADED' },
                  include: {
                    assignment: {
                      include: {
                        course: { select: { id: true, title: true, category: true } },
                      },
                    },
                  },
                  orderBy: { submittedAt: 'desc' },
                  take: 50,
                },
                attendances: {
                  include: {
                    session: {
                      select: {
                        id: true, title: true, scheduledAt: true,
                        startedAt: true, status: true,
                      },
                    },
                  },
                  orderBy: { joinedAt: 'desc' },
                  take: 20,
                },
                _count: { select: { enrollments: true, submissions: true } },
              },
            },
          },
        },
      },
    });
    if (!parent) return [];
    return parent.children.map((ps) => ps.student);
  }

  async getChildrenSchedule(userId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      include: {
        children: {
          include: {
            student: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, avatarUrl: true },
                },
                enrollments: {
                  include: {
                    course: {
                      include: {
                        liveSessions: {
                          where: { status: { in: ['SCHEDULED', 'LIVE'] } },
                          include: {
                            teacher: {
                              include: {
                                user: { select: { firstName: true, lastName: true } },
                              },
                            },
                          },
                          orderBy: { scheduledAt: 'asc' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) return [];

    const seen = new Set<string>();
    const sessions: Array<{
      id: string; title: string; courseName: string; status: string;
      scheduledAt: Date | null; startedAt: Date | null; roomId: string | null;
      teacherName: string; childName: string; childId: string;
    }> = [];

    for (const ps of parent.children) {
      const { student } = ps;
      const childName = `${student.user.firstName} ${student.user.lastName}`;
      for (const enrollment of student.enrollments) {
        for (const session of enrollment.course.liveSessions) {
          const key = `${session.id}:${student.id}`;
          if (seen.has(key)) continue;
          seen.add(key);
          sessions.push({
            id: session.id,
            title: session.title,
            courseName: enrollment.course.title,
            status: session.status,
            scheduledAt: session.scheduledAt,
            startedAt: session.startedAt,
            roomId: session.roomId,
            teacherName: `${session.teacher.user.firstName} ${session.teacher.user.lastName}`,
            childName,
            childId: student.id,
          });
        }
      }
    }

    sessions.sort((a, b) => {
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });

    return sessions;
  }
}
