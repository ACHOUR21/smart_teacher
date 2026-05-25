import {
  Injectable, UnauthorizedException, ConflictException, BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import type { RegisterDto } from './dto/register.dto'
import type { LoginDto } from './dto/login.dto'
import type { Role } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException('Email already in use')

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role as Role,
      },
    })

    await this.createRoleProfile(user.id, user.role)
    const tokens = await this.generateTokens(user.id, user.email, user.role)
    return { user: this.sanitizeUser(user), ...tokens }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    if (!user.isActive) throw new UnauthorizedException('Account is disabled')

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    return { user: this.sanitizeUser(user), ...tokens }
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    })

    return this.generateTokens(stored.user.id, stored.user.email, stored.user.role)
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    })
    return { success: true }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
    return this.sanitizeUser(user)
  }

  private async generateTokens(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role }
    const accessToken = this.jwt.sign(payload)
    const refreshExpiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d')

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn,
    })

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return { accessToken, refreshToken, expiresIn: 900 }
  }

  private async createRoleProfile(userId: string, role: Role) {
    switch (role) {
      case 'TEACHER':
        await this.prisma.teacher.create({ data: { userId } })
        break
      case 'STUDENT':
        await this.prisma.student.create({ data: { userId } })
        break
      case 'PARENT':
        await this.prisma.parent.create({ data: { userId } })
        break
      case 'ADMIN':
        await this.prisma.admin.create({ data: { userId } })
        break
    }
  }

  private sanitizeUser(user: any) {
    const { passwordHash, twoFactorSecret, ...safe } = user
    return safe
  }
}
