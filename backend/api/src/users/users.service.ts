import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; perPage?: number; search?: string; role?: string }) {
    const { page = 1, perPage = 20, search, role } = query
    const skip = (page - 1) * perPage

    const where = {
      ...(role && { role: role as any }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, role: true,
          avatar: true, isActive: true, createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, locale: true, timezone: true,
        isActive: true, createdAt: true, updatedAt: true,
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string; locale?: string; timezone?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, locale: true, timezone: true,
      },
    })
  }

  async deactivate(id: string) {
    return this.prisma.user.update({ where: { id }, data: { isActive: false } })
  }
}
