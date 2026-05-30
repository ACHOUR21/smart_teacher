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
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, chapter: { courseId } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found in this course');

    const progress = await this.prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId, lessonId } },
      create: { lessonId, studentId, isCompleted: true, completedAt: new Date() },
      update: { isCompleted: true, completedAt: new Date() },
    });

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
        if (lesson.progress.some((p) => p.isCompleted)) completedLessons++;
      }
    }

    return {
      courseId,
      totalLessons,
      completedLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    };
  }

  async createChapter(courseId: string, dto: { title: string; order?: number }, teacherId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException(`Course ${courseId} not found`);
    if (course.teacherId !== teacherId) throw new ForbiddenException();
    const count = await this.prisma.chapter.count({ where: { courseId } });
    const chapter = await this.prisma.chapter.create({
      data: { courseId, title: dto.title, order: dto.order ?? count + 1 },
      include: { lessons: true },
    });
    this.cache.del(`courses:one:${courseId}`);
    this.cache.delByPrefix('courses:teacher');
    return chapter;
  }

  async updateChapter(
    courseId: string,
    chapterId: string,
    dto: { title?: string; order?: number },
    teacherId: string,
  ) {
    const chapter = await this.prisma.chapter.findFirst({ where: { id: chapterId, courseId } });
    if (!chapter) throw new NotFoundException('Chapter not found');
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== teacherId) throw new ForbiddenException();
    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.order !== undefined) data.order = dto.order;
    const updated = await this.prisma.chapter.update({ where: { id: chapterId }, data });
    this.cache.del(`courses:one:${courseId}`);
    return updated;
  }

  async deleteChapter(courseId: string, chapterId: string, teacherId: string) {
    const chapter = await this.prisma.chapter.findFirst({ where: { id: chapterId, courseId } });
    if (!chapter) throw new NotFoundException('Chapter not found');
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== teacherId) throw new ForbiddenException();
    // Delete lesson progress and lessons before deleting chapter to avoid FK violations
    const lessons = await this.prisma.lesson.findMany({
      where: { chapterId },
      select: { id: true },
    });
    const lessonIds = lessons.map((l) => l.id);
    if (lessonIds.length > 0) {
      await this.prisma.lessonProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
      await this.prisma.lesson.deleteMany({ where: { chapterId } });
    }
    await this.prisma.chapter.delete({ where: { id: chapterId } });
    this.cache.del(`courses:one:${courseId}`);
    this.cache.delByPrefix('courses:teacher');
  }

  async createLesson(
    courseId: string,
    chapterId: string,
    dto: any,
    teacherId: string,
  ) {
    const chapter = await this.prisma.chapter.findFirst({ where: { id: chapterId, courseId } });
    if (!chapter) throw new NotFoundException('Chapter not found in this course');
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== teacherId) throw new ForbiddenException();
    const count = await this.prisma.lesson.count({ where: { chapterId } });
    const lesson = await this.prisma.lesson.create({
      data: {
        chapterId,
        title: dto.title,
        type: dto.type ?? 'VIDEO',
        content: dto.content ?? null,
        videoUrl: dto.videoUrl ?? null,
        durationMins: dto.durationMins ?? null,
        order: dto.order ?? count + 1,
      },
    });
    this.cache.del(`courses:one:${courseId}`);
    return lesson;
  }

  async updateLesson(
    courseId: string,
    chapterId: string,
    lessonId: string,
    dto: any,
    teacherId: string,
  ) {
    const lesson = await this.prisma.lesson.findFirst({ where: { id: lessonId, chapterId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== teacherId) throw new ForbiddenException();
    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl;
    if (dto.durationMins !== undefined) data.durationMins = dto.durationMins;
    const updated = await this.prisma.lesson.update({ where: { id: lessonId }, data });
    this.cache.del(`courses:one:${courseId}`);
    return updated;
  }

  async deleteLesson(
    courseId: string,
    chapterId: string,
    lessonId: string,
    teacherId: string,
  ) {
    const lesson = await this.prisma.lesson.findFirst({ where: { id: lessonId, chapterId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== teacherId) throw new ForbiddenException();
    await this.prisma.lessonProgress.deleteMany({ where: { lessonId } });
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    this.cache.del(`courses:one:${courseId}`);
  }
}
