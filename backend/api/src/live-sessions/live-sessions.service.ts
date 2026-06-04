import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class LiveSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    courseId?: string;
    teacherId?: string;
    status?: string;
    upcoming?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { courseId, teacherId, status, upcoming, limit = 20, offset = 0 } = params;
    const where: Prisma.LiveSessionWhereInput = {};
    if (courseId) where.courseId = courseId;
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status as Prisma.EnumSessionStatusFilter['equals'];
    if (upcoming) {
      where.OR = [
        { status: 'LIVE' },
        { status: 'SCHEDULED', scheduledAt: { gte: new Date() } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.liveSession.findMany({
        where,
        include: {
          course: { select: { id: true, title: true } },
          teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
          _count: { select: { attendances: true } },
        },
        take: limit,
        skip: offset,
        orderBy: [
          { status: 'asc' },
          { scheduledAt: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.liveSession.count({ where }),
    ]);
    return { data, total, limit, offset };
  }

  async findOne(id: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        teacher: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        attendances: {
          include: {
            student: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });
    if (!session) throw new NotFoundException(`Live session ${id} not found`);
    return session;
  }

  async create(
    dto: { title: string; courseId: string; scheduledAt?: string | Date },
    teacherId: string,
  ) {
    return this.prisma.liveSession.create({
      data: {
        title: dto.title,
        courseId: dto.courseId,
        teacherId,
        roomId: randomUUID(),
        status: 'SCHEDULED',
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      },
      include: {
        course: { select: { id: true, title: true } },
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async startSession(id: string, teacherId: string) {
    const session = await this.prisma.liveSession.findFirst({ where: { id, teacherId } });
    if (!session) throw new NotFoundException(`Session ${id} not found or unauthorized`);
    if (session.status !== 'SCHEDULED') throw new ForbiddenException('Session is not in SCHEDULED status');
    return this.prisma.liveSession.update({
      where: { id },
      data: { status: 'LIVE', startedAt: new Date() },
    });
  }

  async endSession(id: string, teacherId: string) {
    const session = await this.prisma.liveSession.findFirst({ where: { id, teacherId } });
    if (!session) throw new NotFoundException(`Session ${id} not found or unauthorized`);
    if (session.status !== 'LIVE') throw new ForbiddenException('Session is not LIVE');
    return this.prisma.liveSession.update({
      where: { id },
      data: { status: 'ENDED', endedAt: new Date() },
    });
  }

  async joinSession(id: string, studentId: string) {
    const session = await this.prisma.liveSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException(`Session ${id} not found`);

    const attendance = await this.prisma.attendance.upsert({
      where: { sessionId_studentId: { sessionId: id, studentId } },
      update: { joinedAt: new Date(), leftAt: null },
      create: { sessionId: id, studentId, joinedAt: new Date() },
    });

    return { session, attendance, roomId: session.roomId };
  }
}
