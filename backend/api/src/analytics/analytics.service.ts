import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private buildWeekBuckets(
    now: Date,
    weeks: number,
    series: Array<{ data: Array<Record<string, unknown>>; dateField: string; key: string }>,
  ): Array<Record<string, unknown>> {
    const buckets = Array.from({ length: weeks }, (_, i) => {
      const anchor = new Date(now.getTime() - (weeks - 1 - i) * 7 * 24 * 60 * 60 * 1000);
      const monday = new Date(anchor);
      const dow = monday.getDay();
      monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1));
      monday.setHours(0, 0, 0, 0);
      return {
        label: `Wk ${i + 1}`,
        start: monday,
        end: new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000),
      };
    });

    return buckets.map((b) => {
      const row: Record<string, unknown> = { week: b.label };
      for (const s of series) {
        row[s.key] = s.data.filter((d) => {
          const t = d[s.dateField] as Date | null | undefined;
          return t != null && t >= b.start && t < b.end;
        }).length;
      }
      return row;
    });
  }

  async getTeacherWeeklyEngagement(userId: string, weeks = 8) {
    return this.cache.wrap(`analytics:teacher:weekly:${userId}:${weeks}`, async () => {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!teacher) return [];

      const now = new Date();
      const since = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

      const [completions, submissions, attendances] = await Promise.all([
        this.prisma.lessonProgress.findMany({
          where: {
            isCompleted: true,
            completedAt: { gte: since },
            lesson: { chapter: { course: { teacherId: teacher.id } } },
          },
          select: { completedAt: true },
        }),
        this.prisma.submission.findMany({
          where: {
            submittedAt: { gte: since },
            assignment: { course: { teacherId: teacher.id } },
          },
          select: { submittedAt: true },
        }),
        this.prisma.attendance.findMany({
          where: {
            joinedAt: { gte: since },
            session: { teacherId: teacher.id },
          },
          select: { joinedAt: true },
        }),
      ]);

      return this.buildWeekBuckets(now, weeks, [
        { data: completions as Array<Record<string, unknown>>, dateField: 'completedAt', key: 'views' },
        { data: submissions as Array<Record<string, unknown>>, dateField: 'submittedAt', key: 'submissions' },
        { data: attendances as Array<Record<string, unknown>>, dateField: 'joinedAt', key: 'liveAttendance' },
      ]);
    }, 60_000);
  }

  async getAdminWeeklyEngagement(weeks = 6) {
    return this.cache.wrap(`analytics:admin:weekly:${weeks}`, async () => {
      const now = new Date();
      const since = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

      const [attendances, aiSessions] = await Promise.all([
        this.prisma.attendance.findMany({
          where: { joinedAt: { gte: since } },
          select: { joinedAt: true },
        }),
        this.prisma.aISession.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true },
        }),
      ]);

      return this.buildWeekBuckets(now, weeks, [
        { data: attendances as Array<Record<string, unknown>>, dateField: 'joinedAt', key: 'sessions' },
        { data: aiSessions as Array<Record<string, unknown>>, dateField: 'createdAt', key: 'aiChats' },
      ]);
    }, 2 * 60_000);
  }

  async getCourseCompletionByCategory() {
    return this.cache.wrap('analytics:admin:completion-by-category', async () => {
      const [courses, completedProgress] = await Promise.all([
        this.prisma.course.findMany({
          where: { isPublished: true },
          select: {
            id: true,
            category: true,
            _count: { select: { enrollments: true } },
            chapters: {
              select: {
                lessons: { select: { id: true } },
              },
            },
          },
        }),
        this.prisma.lessonProgress.findMany({
          where: {
            isCompleted: true,
            lesson: { chapter: { course: { isPublished: true } } },
          },
          select: {
            lesson: { select: { chapter: { select: { courseId: true } } } },
          },
        }),
      ]);

      const completionsByCourse: Record<string, number> = {};
      for (const p of completedProgress) {
        const cId = p.lesson.chapter.courseId;
        completionsByCourse[cId] = (completionsByCourse[cId] ?? 0) + 1;
      }

      const categoryMap: Record<string, { total: number; completed: number }> = {};
      for (const course of courses) {
        const cat = course.category ?? 'Other';
        const totalLessons = course.chapters.reduce((s, ch) => s + ch.lessons.length, 0);
        const enrollments = course._count.enrollments;
        const completed = completionsByCourse[course.id] ?? 0;
        const possible = totalLessons * enrollments;
        if (!categoryMap[cat]) categoryMap[cat] = { total: 0, completed: 0 };
        categoryMap[cat].total += possible;
        categoryMap[cat].completed += completed;
      }

      return Object.entries(categoryMap)
        .filter(([, v]) => v.total > 0)
        .map(([subject, { total, completed }]) => ({
          subject,
          rate: Math.round((completed / total) * 100),
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 8);
    }, 5 * 60_000);
  }

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
            isPublished: true,
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

      const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
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
          status: c.isPublished ? 'PUBLISHED' : 'DRAFT',
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
          this.prisma.course.count({ where: { isPublished: true } }),
          this.prisma.enrollment.count({
            where: {
              enrolledAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
          }),
          this.prisma.aISession.count(),
        ]);

      const now = new Date();
      const usersByMonth = await Promise.all(
        Array.from({ length: 6 }, async (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
          const [count, students, teachers] = await Promise.all([
            this.prisma.user.count({ where: { createdAt: { gte: d, lt: next } } }),
            this.prisma.user.count({ where: { createdAt: { gte: d, lt: next }, role: 'STUDENT' } }),
            this.prisma.user.count({ where: { createdAt: { gte: d, lt: next }, role: 'TEACHER' } }),
          ]);
          return {
            month: d.toLocaleString('en-US', { month: 'short' }),
            count,
            students,
            teachers,
          };
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

      const weekStart = new Date();
      const dow = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
      weekStart.setHours(0, 0, 0, 0);

      const [enrollments, completedLessons, submissions, attendances, weeklyLessons] =
        await Promise.all([
          this.prisma.enrollment.count({ where: { studentId } }),
          this.prisma.lessonProgress.count({ where: { studentId, isCompleted: true } }),
          this.prisma.submission.findMany({
            where: { studentId },
            select: { score: true, status: true, submittedAt: true },
            orderBy: { submittedAt: 'desc' },
            take: 20,
          }),
          this.prisma.attendance.count({ where: { studentId } }),
          this.prisma.lessonProgress.findMany({
            where: { studentId, isCompleted: true, completedAt: { gte: weekStart } },
            select: {
              completedAt: true,
              lesson: { select: { durationMins: true } },
            },
          }),
        ]);

      const gradedSubs = submissions.filter((s) => s.status === 'GRADED');
      const avgScore =
        gradedSubs.length > 0
          ? Math.round(
              gradedSubs.reduce((sum, s) => sum + (s.score ?? 0), 0) / gradedSubs.length,
            )
          : null;

      const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyActivity = DAYS.map((day, i) => {
        const s = new Date(weekStart.getTime() + i * 86_400_000);
        const e = new Date(s.getTime() + 86_400_000);
        return {
          day,
          minutes: weeklyLessons
            .filter((l) => l.completedAt != null && l.completedAt >= s && l.completedAt < e)
            .reduce((sum, l) => sum + (l.lesson.durationMins ?? 15), 0),
        };
      });

      return {
        enrollments,
        completedLessons,
        submissions: submissions.length,
        gradedSubmissions: gradedSubs.length,
        avgScore,
        attendances,
        weeklyActivity,
        recentScores: gradedSubs.slice(0, 10).map((s) => ({
          score: s.score,
          date: s.submittedAt,
        })),
      };
    }, 2 * 60_000);
  }

  async getAuditLogs(limit = 50, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count(),
    ]);
    return { data, total, limit, offset };
  }
}
