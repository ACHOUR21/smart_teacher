import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    search?: string;
    category?: string;
    teacherId?: string;
    isPublished?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { search, category, teacherId, isPublished, limit = 20, offset = 0 } = params;
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (teacherId) where.teacherId = teacherId;
    if (isPublished !== undefined) where.isPublished = isPublished;

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          teacher: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
          _count: { select: { enrollments: true, chapters: true } },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);
    return { data, total, limit, offset };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        chapters: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async create(dto: any, teacherId: string) {
    return this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        difficulty: dto.difficulty,
        thumbnailUrl: dto.thumbnailUrl,
        isPublished: dto.isPublished ?? false,
        teacherId,
      },
    });
  }

  async update(id: string, dto: any, teacherId: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    if (course.teacherId !== teacherId) throw new ForbiddenException();
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  async enroll(courseId: string, studentId: string) {
    const existing = await this.prisma.enrollment.findFirst({ where: { courseId, studentId } });
    if (existing) return existing;
    return this.prisma.enrollment.create({
      data: { courseId, studentId, enrolledAt: new Date() },
    });
  }

  async getMyEnrollments(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            _count: { select: { chapters: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async getMyTeacherCourses(teacherId: string) {
    return this.prisma.course.findMany({
      where: { teacherId },
      include: { _count: { select: { enrollments: true, chapters: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
