import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { randomUUID } from 'crypto'

@Injectable()
export class LiveSessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { courseId?: string; status?: string }) {
    return this.prisma.liveSession.findMany({
      where: {
        ...(query.courseId && { courseId: query.courseId }),
        ...(query.status && { status: query.status as any }),
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        teacher: { include: { user: { select: { name: true, avatar: true } } } },
        course: { select: { title: true } },
        _count: { select: { attendances: true } },
      },
    })
  }

  async create(teacherUserId: string, data: { courseId: string; title: string; scheduledAt: Date }) {
    const teacher = await this.prisma.teacher.findUniqueOrThrow({ where: { userId: teacherUserId } })
    return this.prisma.liveSession.create({
      data: {
        courseId: data.courseId,
        teacherId: teacher.id,
        title: data.title,
        scheduledAt: new Date(data.scheduledAt),
        roomId: randomUUID(),
      },
    })
  }

  async startSession(id: string, teacherUserId: string) {
    const session = await this.prisma.liveSession.findUniqueOrThrow({ where: { id }, include: { teacher: true } })
    if (session.teacher.userId !== teacherUserId) throw new ForbiddenException()
    return this.prisma.liveSession.update({ where: { id }, data: { status: 'LIVE' } })
  }

  async endSession(id: string, teacherUserId: string) {
    const session = await this.prisma.liveSession.findUniqueOrThrow({ where: { id }, include: { teacher: true } })
    if (session.teacher.userId !== teacherUserId) throw new ForbiddenException()
    return this.prisma.liveSession.update({ where: { id }, data: { status: 'ENDED', endedAt: new Date() } })
  }

  async joinSession(id: string, studentUserId: string) {
    const student = await this.prisma.student.findUniqueOrThrow({ where: { userId: studentUserId } })
    const session = await this.prisma.liveSession.findUniqueOrThrow({ where: { id } })
    if (session.status !== 'LIVE') throw new ForbiddenException('Session is not live')

    await this.prisma.attendance.upsert({
      where: { studentId_liveSessionId: { studentId: student.id, liveSessionId: id } },
      create: { studentId: student.id, liveSessionId: id, status: 'PRESENT', joinedAt: new Date() },
      update: { joinedAt: new Date() },
    })

    return { roomId: session.roomId, sessionId: id }
  }
}
