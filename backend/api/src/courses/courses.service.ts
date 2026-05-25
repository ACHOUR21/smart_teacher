import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; perPage?: number; search?: string; status?: string }) {
    const { page = 1, perPage = 20, search, status } = query
    const skip = (page - 1) * perPage

    const where = {
      ...(status && { status: status as any }),
      ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: { include: { user: { select: { name: true, avatar: true } } } },
          _count: { select: { enrollments: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ])

    return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) }
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: { select: { name: true, avatar: true } } } },
        chapters: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } },
        },
        _count: { select: { enrollments: true } },
      },
    })
    if (!course) throw new NotFoundException('Course not found')
    return course
  }

  async create(teacherId: string, data: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: teacherId } })
    if (!teacher) throw new ForbiddenException('Teacher profile not found')

    return this.prisma.course.create({
      data: { ...data, teacherId: teacher.id },
    })
  }

  async update(courseId: string, teacherUserId: string, data: any) {
    const course = await this.prisma.course.findUniqueOrThrow({
      where: { id: courseId },
      include: { teacher: true },
    })

    if (course.teacher.userId !== teacherUserId) {
      throw new ForbiddenException('Not authorized to edit this course')
    }

    return this.prisma.course.update({ where: { id: courseId }, data })
  }

  async enroll(courseId: string, studentUserId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } })
    if (!student) throw new ForbiddenException('Student profile not found')

    return this.prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: student.id, courseId } },
      create: { studentId: student.id, courseId },
      update: {},
    })
  }

  async getMyTeacherCourses(teacherUserId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: teacherUserId } })
    if (!teacher) return []

    return this.prisma.course.findMany({
      where: { teacherId: teacher.id },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { enrollments: true } } },
    })
  }

  async getMyStudentCourses(studentUserId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } })
    if (!student) return []

    return this.prisma.enrollment.findMany({
      where: { studentId: student.id },
      orderBy: { enrolledAt: 'desc' },
      include: {
        course: {
          include: {
            teacher: { include: { user: { select: { name: true } } } },
            _count: { select: { enrollments: true } },
          },
        },
      },
    })
  }
}
