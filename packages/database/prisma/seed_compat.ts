import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');
  const hash = await bcrypt.hash('Password123!', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eduai.com' },
    update: {},
    create: { email: 'admin@eduai.com', passwordHash: hash, firstName: 'Platform', lastName: 'Admin', role: Role.ADMIN, isActive: true },
  });
  await prisma.admin.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id } });

  // Teacher
  const teacherUser = await prisma.user.upsert({
    where: { email: 'sarah.johnson@teacher.edu' },
    update: {},
    create: { email: 'sarah.johnson@teacher.edu', passwordHash: hash, firstName: 'Sarah', lastName: 'Johnson', role: Role.TEACHER, isActive: true },
  });
  const teacher = await prisma.teacher.upsert({ where: { userId: teacherUser.id }, update: {}, create: { userId: teacherUser.id, bio: 'Math teacher', specialties: ['Mathematics', 'Physics'] } });

  // Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'amir.hassan@student.edu' },
    update: {},
    create: { email: 'amir.hassan@student.edu', passwordHash: hash, firstName: 'Amir', lastName: 'Hassan', role: Role.STUDENT, isActive: true },
  });
  const student = await prisma.student.upsert({ where: { userId: studentUser.id }, update: {}, create: { userId: studentUser.id, grade: '10th' } });

  // Parent
  const parentUser = await prisma.user.upsert({
    where: { email: 'fatima.hassan@parent.edu' },
    update: {},
    create: { email: 'fatima.hassan@parent.edu', passwordHash: hash, firstName: 'Fatima', lastName: 'Hassan', role: Role.PARENT, isActive: true },
  });
  const parent = await prisma.parent.upsert({ where: { userId: parentUser.id }, update: {}, create: { userId: parentUser.id } });

  // Link parent to student
  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent.id, studentId: student.id } },
    update: {},
    create: { parentId: parent.id, studentId: student.id },
  });

  // Course
  const course = await prisma.course.upsert({
    where: { id: 'demo-course-1' },
    update: {},
    create: { id: 'demo-course-1', title: 'Introduction to Algebra', description: 'Fundamentals of algebra for 10th grade', category: 'Mathematics', difficulty: 'Intermediate', isPublished: true, teacherId: teacher.id },
  });

  // Chapter
  let chapter = await prisma.chapter.findFirst({ where: { courseId: course.id } });
  if (!chapter) {
    chapter = await prisma.chapter.create({ data: { title: 'Chapter 1: Variables', order: 1, courseId: course.id } });
  }

  // Lesson
  let lesson = await prisma.lesson.findFirst({ where: { chapterId: chapter.id } });
  if (!lesson) {
    lesson = await prisma.lesson.create({ data: { title: 'What are Variables?', type: 'VIDEO', durationMins: 15, order: 1, chapterId: chapter.id } });
  }

  // Enroll student
  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
    update: {},
    create: { studentId: student.id, courseId: course.id },
  });

  // Assignment
  let assignment = await prisma.assignment.findFirst({ where: { courseId: course.id } });
  if (!assignment) {
    assignment = await prisma.assignment.create({ data: { title: 'Algebra Quiz 1', description: 'Basic algebra questions', totalPoints: 100, courseId: course.id } });
  }

  // Submission
  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student.id } },
    update: {},
    create: { assignmentId: assignment.id, studentId: student.id, answers: {}, score: 85, status: 'GRADED', gradedAt: new Date() },
  });

  // Subscription
  await prisma.subscription.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: { userId: parentUser.id, plan: 'Pro', status: 'ACTIVE', startsAt: new Date() },
  });

  console.log('✅ Seed complete');
  console.log('  admin@eduai.com        / Password123!');
  console.log('  sarah.johnson@teacher.edu / Password123!');
  console.log('  amir.hassan@student.edu   / Password123!');
  console.log('  fatima.hassan@parent.edu  / Password123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
