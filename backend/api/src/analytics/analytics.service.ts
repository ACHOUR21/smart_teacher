import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getTeacherAnalytics(userId: string) {
    return this.cache.wrap(`analytics:teacher:${userId}`, async () => {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!teacher) return null;

      const teacherId = teacher.id;

      const [courses, gradedSubmissions, liveSessionCount] = await Promise.all([
        this.prisma.course.findMany({
          where: { teacherId },
          select: {
            id: true,
            title: true,
            status: true,
            _count: { select: { enrollments: true, chapters: true } },
          },
        }),
        this.prisma.submission.findMany({
          where: {
            assignment: { course: { teacherId } },
            status: 'GRADED',
          },
          select: { score: true, submittedAt: true },
        }),
        this.prisma.liveSession.count({ where: { teacherId } }),
      ]);

      // Grade distribution buckets
      const gradeDistribution = [
        { grade: 'A', range: '90-100', count: 0 },
        { grade: 'B', range: '80-89', count: 0 },
        { grade: 'C', range: '70-79', count: 0 },
        { grade: 'D', range: '60-69', count: 0 },
        { grade: 'F', range: '0-59', count: 0 },
      ];
      for (const sub of gradedSubmissions) {
        const s = sub.score ?? 0;
        if (s >= 90) gradeDistribution[0].count++;
        else if (s >= 80) gradeDistribution[1].count++;
        else if (s >= 70) gradeDistribution[2].count++;
        else if (s >= 60) gradeDistribution[3].count++;
        else gradeDistribution[4].count++;
      }

      // Monthly submission trend – last 6 months
      const now = new Date();
      const submissionTrend = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        return {
          month: d.toLocaleString('en-US', { month: 'short' }),
          count: gradedSubmissions.filter(
            (s) => s.submittedAt >= d && s.submittedAt < next,
          ).length,
        };
      });

      const totalStudents = courses.reduce(
        (sum, c) => sum + c._count.enrollments,
        0,
      );
      const avgScore =
        gradedSubmissions.length > 0
          ? Math.round(
              gradedSubmissions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
                gradedSubmissions.length,
            )
          : 0;

      return {
        totalCourses: courses.length,
        totalStudents,
        totalSubmissions: gradedSubmissions.length,
        avgScore,
        liveSessions: liveSessionCount,
        courses: courses.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          enrolled: c._count.enrollments,
          chapters: c._count.chapters,
        })),
        gradeDistribution,
        submissionTrend,
      };
    }, 2 * 60_000);
  }

  async getAdminAnalytics() {
    return this.cache.wrap('analytics:admin', async () => {
      const [userCounts, totalCourses, publishedCourses, recentEnrollments, aiSessionCount] =
        await Promise.all([
          this.prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
          this.prisma.course.count(),
          this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
          this.prisma.enrollment.count({
            where: {
              enrolledAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
          }),
          this.prisma.aISession.count(),
        ]);

      // Registration trend – last 6 months
      const now = new Date();
      const usersByMonth = await Promise.all(
        Array.from({ length: 6 }, async (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
          const count = await this.prisma.user.count({
            where: { createdAt: { gte: d, lt: next } },
          });
          return { month: d.toLocaleString('en-US', { month: 'short' }), count };
        }),
      );

      const byRole = userCounts.reduce(
        (acc, r) => ({ ...acc, [r.role]: r._count.id }),
        {} as Record<string, number>,
      );

      return {
        users: { byRole, trend: usersByMonth },
        courses: { total: totalCourses, published: publishedCourses, draft: totalCourses - publishedCourses },
        activity: { recentEnrollments, aiSessions: aiSessionCount },
      };
    }, 5 * 60_000);
  }

  async getStudentAnalytics(userId: string) {
    return this.cache.wrap(`analytics:student:${userId}`, async () => {
      const student = await this.prisma.student.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!student) return null;

      const studentId = student.id;

      const [enrollments, completedLessons, submissions, attendances] =
        await Promise.all([
          this.prisma.enrollment.count({ where: { studentId } }),
          this.prisma.lessonProgress.count({ where: { studentId, completed: true } }),
          this.prisma.submission.findMany({
            where: { studentId },
            select: { score: true, status: true, submittedAt: true },
            orderBy: { submittedAt: 'desc' },
            take: 20,
          }),
          this.prisma.attendance.count({ where: { studentId } }),
        ]);

      const gradedSubs = submissions.filter((s) => s.status === 'GRADED');
      const avgScore =
        gradedSubs.length > 0
          ? Math.round(
              gradedSubs.reduce((sum, s) => sum + (s.score ?? 0), 0) / gradedSubs.length,
            )
          : null;

      return {
        enrollments,
        completedLessons,
        submissions: submissions.length,
        gradedSubmissions: gradedSubs.length,
        avgScore,
        attendances,
        recentScores: gradedSubs.slice(0, 10).map((s) => ({
          score: s.score,
          date: s.submittedAt,
        })),
      };
    }, 2 * 60_000);
  }
}
