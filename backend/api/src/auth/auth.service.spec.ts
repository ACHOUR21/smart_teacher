import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  student: { create: jest.fn() },
  teacher: { create: jest.fn() },
  parent: { create: jest.fn() },
  admin: { create: jest.fn() },
};

const mockJwt = { sign: jest.fn().mockReturnValue('mock-token') };
const mockConfig = { get: jest.fn().mockReturnValue('secret') };
const mockEmail = { send: jest.fn().mockResolvedValue(undefined) };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws ConflictException if email already registered', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });
      await expect(
        service.register({ email: 'test@test.com', password: 'pass', firstName: 'A', lastName: 'B', role: Role.STUDENT }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates user and returns tokens on success', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const newUser = { id: 'u1', email: 'new@test.com', firstName: 'New', lastName: 'User', role: Role.STUDENT, passwordHash: 'hash', isActive: true, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.user.create.mockResolvedValue(newUser);
      mockPrisma.student.create.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({ email: 'new@test.com', password: 'password123', firstName: 'New', lastName: 'User', role: Role.STUDENT });

      expect(result.user.email).toBe('new@test.com');
      expect(result.accessToken).toBeDefined();
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login('no@one.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', passwordHash: hash, isActive: true, role: Role.STUDENT });
      await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens on valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      const user = { id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B', passwordHash: hash, isActive: true, role: Role.STUDENT, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login('a@b.com', 'password123');
      expect(result.accessToken).toBeDefined();
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });
});
