import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { courseId?: string; page?: number; perPage?: number }) {
    const { courseId, page = 1, perPage = 20 } = query
    const skip = (page - 1) * perPage
    const where = courseId ? { courseId } : {}

    const [data, total] = await this.prisma.$transaction([
      this.prisma.assignment.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          course: { select: { title: true } },
          _count: { select: { submissions: true } },
        },
      }),
      this.prisma.assignment.count({ where }),
    ])

    return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) }
  }

  async findOne(id: string) {
    const a = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        course: { select: { title: true } },
        _count: { select: { submissions: true } },
      },
    })
    if (!a) throw new NotFoundException('Assignment not found')
    return a
  }

  async create(teacherUserId: string, data: any) {
    const teacher = await this.prisma.teacher.findUniqueOrThrow({ where: { userId: teacherUserId } })
    const { questions, ...rest } = data
    return this.prisma.assignment.create({
      data: {
        ...rest,
        teacherId: teacher.id,
        questions: questions
          ? { create: questions.map((q: any, i: number) => ({ ...q, order: i })) }
          : undefined,
      },
      include: { questions: true },
    })
  }

  async update(id: string, teacherUserId: string, data: any) {
    const a = await this.prisma.assignment.findUniqueOrThrow({ where: { id }, include: { teacher: true } })
    if (a.teacher.userId !== teacherUserId) throw new ForbiddenException()
    const { questions, ...rest } = data
    return this.prisma.assignment.update({ where: { id }, data: rest })
  }

  async submit(id: string, studentUserId: string, answers: any) {
    const student = await this.prisma.student.findUniqueOrThrow({ where: { userId: studentUserId } })
    const assignment = await this.prisma.assignment.findUniqueOrThrow({
      where: { id },
      include: { questions: true },
    })

    // Auto-grade MCQ questions
    let score = 0
    let totalAutoGrade = 0
    if (assignment.questions.length > 0 && answers) {
      for (const q of assignment.questions) {
        if (q.type === 'mcq' && q.correctAnswer) {
          totalAutoGrade += Number(q.points)
          if (answers[q.id] === q.correctAnswer) score += Number(q.points)
        }
      }
    }

    const autoGraded = totalAutoGrade > 0
    return this.prisma.submission.upsert({
      where: { assignmentId_studentId: { assignmentId: id, studentId: student.id } },
      create: {
        assignmentId: id,
        studentId: student.id,
        answers,
        status: 'SUBMITTED',
        score: autoGraded ? score : undefined,
        aiGraded: autoGraded,
        gradedAt: autoGraded ? new Date() : undefined,
      },
      update: { answers, status: 'SUBMITTED', submittedAt: new Date() },
    })
  }

  async getSubmissions(assignmentId: string) {
    return this.prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: { include: { user: { select: { name: true, avatar: true } } } },
      },
      orderBy: { submittedAt: 'desc' },
    })
  }

  async gradeSubmission(submissionId: string, score: number, feedback: string) {
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: { score, feedback, status: 'GRADED', gradedAt: new Date() },
    })
  }

  async getMyStudentAssignments(studentUserId: string) {
    const student = await this.prisma.student.findUniqueOrThrow({ where: { userId: studentUserId } })
    const enrollments = await this.prisma.enrollment.findMany({ where: { studentId: student.id }, select: { courseId: true } })
    const courseIds = enrollments.map((e) => e.courseId)

    return this.prisma.assignment.findMany({
      where: { courseId: { in: courseIds }, status: 'PUBLISHED' },
      orderBy: { dueAt: 'asc' },
      include: {
        course: { select: { title: true } },
        submissions: { where: { studentId: student.id }, select: { status: true, score: true } },
      },
    })
  }
}
