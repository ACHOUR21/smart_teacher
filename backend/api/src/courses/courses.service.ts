import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(params: {
    search?: string;
    category?: string;
    teacherId?: string;
    isPublished?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { search, category, teacherId, isPublished, limit = 20, offset = 0 } = params;
    const cacheKey = `courses:list:${JSON.stringify(params)}`;

    return this.cache.wrap(
      cacheKey,
      async () => {
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
              teacher: {
                include: {
                  user: { select: { firstName: true, lastName: true, avatarUrl: true } },
                },
              },
              _count: { select: { enrollments: true, chapters: true } },
            },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.course.count({ where }),
        ]);
        return { data, total, limit, offset };
      },
      30_000,
    );
  }

  async findOne(id: string) {
    return this.cache.wrap(
      `courses:one:${id}`,
      async () => {
        const course = await this.prisma.course.findUnique({
          where: { id },
          include: {
            teacher: {
              include: {
                user: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
            chapters: {
              orderBy: { order: 'asc' },
              include: { lessons: { orderBy: { order: 'asc' } } },
            },
            _count: { select: { enrollments: true } },
          },
        });
        if (!course) throw new NotFoundException(`Course ${id} not found`);
        return course;
      },
      60_000,
    );
  }

  async create(dto: any, teacherId: string) {
    const course = await this.prisma.course.create({
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
    this.cache.delByPrefix('courses:list');
    return course;
  }

  async update(id: string, dto: any, teacherId: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    if (course.teacherId !== teacherId) throw new ForbiddenException();
    const updated = await this.prisma.course.update({ where: { id }, data: dto });
    this.cache.del(`courses:one:${id}`);
    this.cache.delByPrefix('courses:list');
    return updated;
  }

  async enroll(courseId: string, studentId: string) {
    const existing = await this.prisma.enrollment.findFirst({
      where: { courseId, studentId },
    });
    if (existing) return existing;
    const enrollment = await this.prisma.enrollment.create({
      data: { courseId, studentId, enrolledAt: new Date() },
    });
    this.cache.del(`courses:one:${courseId}`);
    this.cache.del(`enrollments:student:${studentId}`);
    return enrollment;
  }

  async getMyEnrollments(studentId: string) {
    return this.cache.wrap(
      `enrollments:student:${studentId}`,
      () =>
        this.prisma.enrollment.findMany({
          where: { studentId },
          include: {
            course: {
              include: {
                teacher: {
                  include: { user: { select: { firstName: true, lastName: true } } },
                },
                _count: { select: { chapters: true } },
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        }),
      60_000,
    );
  }

  async getMyTeacherCourses(teacherId: string) {
    return this.cache.wrap(
      `courses:teacher:${teacherId}`,
      () =>
        this.prisma.course.findMany({
          where: { teacherId },
          include: { _count: { select: { enrollments: true, chapters: true } } },
          orderBy: { createdAt: 'desc' },
        }),
      60_000,
    );
  }

  async completeLesson(courseId: string, lessonId: string, studentId: string) {
    // Verify lesson belongs to the course
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, chapter: { courseId } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found in this course');

    const progress = await this.prisma.lessonProgress.upsert({
      where: { lessonId_studentId: { lessonId, studentId } },
      create: { lessonId, studentId, completed: true, completedAt: new Date() },
      update: { completed: true, completedAt: new Date() },
    });

    // Invalidate student analytics cache
    this.cache.delByPrefix('analytics:student');
    return progress;
  }

  async getCourseProgress(courseId: string, studentId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            lessons: {
              include: {
                progress: { where: { studentId } },
              },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    let totalLessons = 0;
    let completedLessons = 0;
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        totalLessons++;
        if (lesson.progress.some((p) => p.completed)) completedLessons++;
      }
    }

    return {
      courseId,
      totalLessons,
      completedLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    };
  }
}
