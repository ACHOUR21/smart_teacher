import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    courseId?: string;
    teacherId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const { courseId, teacherId, search, limit = 20, offset = 0 } = params;
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (teacherId) where.course = { teacherId };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where,
        include: { course: true, _count: { select: { submissions: true } } },
        take: limit,
        skip: offset,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.assignment.count({ where }),
    ]);

    return { data, total, limit, offset };
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { questions: true, course: true },
    });
    if (!assignment) throw new NotFoundException(`Assignment ${id} not found`);
    return assignment;
  }

  async create(dto: {
    title: string;
    description: string;
    dueDate?: Date;
    totalPoints: number;
    courseId: string;
    questions?: {
      text: string;
      type: 'MCQ' | 'TEXT';
      options?: any;
      correctAnswer?: string;
      points: number;
    }[];
  }) {
    const { questions, ...assignmentData } = dto;
    return this.prisma.assignment.create({
      data: {
        ...assignmentData,
        ...(questions?.length
          ? {
              questions: {
                create: questions.map((q) => ({
                  text: q.text,
                  type: q.type,
                  options: q.options ?? undefined,
                  correctAnswer: q.correctAnswer ?? null,
                  points: q.points,
                })),
              },
            }
          : {}),
      },
      include: { questions: true, course: true },
    });
  }

  async getMyStudentAssignments(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);

    return this.prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: true,
        questions: true,
        submissions: { where: { studentId }, take: 1 },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async submit(
    id: string,
    studentId: string,
    answers: { questionId: string; answer: string }[],
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!assignment) throw new NotFoundException(`Assignment ${id} not found`);

    const existing = await this.prisma.submission.findFirst({
      where: { assignmentId: id, studentId },
    });
    if (existing) throw new BadRequestException('Already submitted');

    const questionMap = new Map(assignment.questions.map((q) => [q.id, q]));
    let score = 0;
    let hasText = false;

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;
      if (q.type === 'MCQ') {
        if (q.correctAnswer && ans.answer === q.correctAnswer) score += q.points;
      } else {
        hasText = true;
      }
    }

    const status = hasText ? 'SUBMITTED' : 'GRADED';
    return this.prisma.submission.create({
      data: {
        assignmentId: id,
        studentId,
        answers: answers as any,
        score: hasText ? null : score,
        status,
        submittedAt: new Date(),
        gradedAt: hasText ? null : new Date(),
      },
    });
  }

  async getSubmissions(assignmentId: string) {
    const exists = await this.prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!exists) throw new NotFoundException(`Assignment ${assignmentId} not found`);

    return this.prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async gradeSubmission(
    assignmentId: string,
    submissionId: string,
    data: { score: number; feedback: string },
  ) {
    const sub = await this.prisma.submission.findFirst({
      where: { id: submissionId, assignmentId },
    });
    if (!sub) throw new NotFoundException(`Submission ${submissionId} not found`);

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: { score: data.score, feedback: data.feedback, status: 'GRADED', gradedAt: new Date() },
    });
  }
}
