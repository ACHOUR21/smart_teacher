import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    page = 1,
    limit = 20,
    search,
    teacherId,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    teacherId?: string;
  }) {
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (teacherId) where.teacherId = teacherId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, courses] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: { include: { user: { select: { name: true } } } },
          _count: { select: { enrollments: true, chapters: true } },
        },
      }),
    ]);

    return { data: courses, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: { select: { name: true, avatarUrl: true } } } },
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: { _count: { select: { resources: true } } },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(
    dto: { title: string; description?: string; subject?: string; gradeLevel?: string },
    userId: string,
  ) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) throw new ForbiddenException('Only teachers can create courses');
    return this.prisma.course.create({
      data: { ...dto, teacherId: teacher.id, status: 'DRAFT' },
    });
  }

  async update(
    id: string,
    dto: { title?: string; description?: string; status?: string },
    userId: string,
  ) {
    const course = await this.prisma.course.findUnique({ where: { id }, include: { teacher: true } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.teacher.userId !== userId) throw new ForbiddenException();
    return this.prisma.course.update({ where: { id }, data: dto as never });
  }

  async enroll(courseId: string, userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new ForbiddenException('Only students can enroll');
    return this.prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: student.id, courseId } },
      create: { studentId: student.id, courseId },
      update: {},
    });
  }

  async getMyEnrollments(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) return [];
    return this.prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          include: {
            teacher: { include: { user: { select: { name: true } } } },
            _count: { select: { chapters: true, enrollments: true } },
          },
        },
      },
    });
  }

  async getMyTeacherCourses(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return [];
    return this.prisma.course.findMany({
      where: { teacherId: teacher.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { enrollments: true, chapters: true } } },
    });
  }
}
