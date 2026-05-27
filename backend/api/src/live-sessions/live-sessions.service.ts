import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class LiveSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    courseId?: string;
    teacherId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const { courseId, teacherId, status, limit = 20, offset = 0 } = params;
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.liveSession.findMany({
        where,
        include: {
          course: true,
          teacher: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.liveSession.count({ where }),
    ]);
    return { data, total, limit, offset };
  }

  async findOne(id: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
      include: {
        course: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        attendances: true,
      },
    });
    if (!session) throw new NotFoundException(`Live session ${id} not found`);
    return session;
  }

  async create(dto: { title: string; courseId: string; scheduledAt?: Date }, teacherId: string) {
    return this.prisma.liveSession.create({
      data: {
        title: dto.title,
        courseId: dto.courseId,
        teacherId,
        roomId: randomUUID(),
        status: 'SCHEDULED',
        startedAt: dto.scheduledAt ?? null,
      },
      include: {
        course: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async startSession(id: string, teacherId: string) {
    const session = await this.prisma.liveSession.findFirst({ where: { id, teacherId } });
    if (!session) throw new NotFoundException(`Session ${id} not found or unauthorized`);
    return this.prisma.liveSession.update({ where: { id }, data: { status: 'LIVE', startedAt: new Date() } });
  }

  async endSession(id: string, teacherId: string) {
    const session = await this.prisma.liveSession.findFirst({ where: { id, teacherId } });
    if (!session) throw new NotFoundException(`Session ${id} not found or unauthorized`);
    return this.prisma.liveSession.update({ where: { id }, data: { status: 'ENDED', endedAt: new Date() } });
  }

  async joinSession(id: string, studentId: string) {
    const session = await this.prisma.liveSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException(`Session ${id} not found`);

    const attendance = await this.prisma.attendance.upsert({
      where: { sessionId_studentId: { sessionId: id, studentId } },
      update: { joinedAt: new Date(), leftAt: null },
      create: { sessionId: id, studentId, joinedAt: new Date() },
    });

    return { session, attendance };
  }
}
