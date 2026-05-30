import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async search(query: string, type?: string, limit = 10) {
    if (!query || query.trim().length < 2) return { courses: [], users: [], assignments: [] };

    const q = query.trim();
    const cacheKey = `search:${q}:${type}:${limit}`;

    return this.cache.wrap(cacheKey, async () => {
      const mode = 'insensitive' as const;

      const [courses, users, assignments] = await Promise.all([
        !type || type === 'courses'
          ? this.prisma.course.findMany({
              where: {
                isPublished: true,
                OR: [
                  { title: { contains: q, mode } },
                  { description: { contains: q, mode } },
                  { category: { contains: q, mode } },
                ],
              },
              select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                category: true,
                difficulty: true,
                teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
                _count: { select: { enrollments: true } },
              },
              take: limit,
            })
          : [],
        !type || type === 'users'
          ? this.prisma.user.findMany({
              where: {
                isActive: true,
                OR: [
                  { firstName: { contains: q, mode } },
                  { lastName: { contains: q, mode } },
                  { email: { contains: q, mode } },
                ],
              },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                avatarUrl: true,
              },
              take: limit,
            })
          : [],
        !type || type === 'assignments'
          ? this.prisma.assignment.findMany({
              where: {
                title: { contains: q, mode },
              },
              select: {
                id: true,
                title: true,
                description: true,
                dueDate: true,
                course: { select: { id: true, title: true } },
              },
              take: limit,
            })
          : [],
      ]);

      return { courses, users, assignments };
    }, 15_000);
  }
}
