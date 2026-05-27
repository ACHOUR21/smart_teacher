// Minimal Prisma client mock for unit tests
export const Role = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

// Re-export everything else as passthrough
export * from '@prisma/client';
