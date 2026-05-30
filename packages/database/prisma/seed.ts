import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hash = await bcrypt.hash('Password123!', 12);

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@eduai.platform' },
    update: {},
    create: {
      name: 'Platform Admin',
      email: 'admin@eduai.platform',
      passwordHash: hash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id },
  });

  // ── Teachers ───────────────────────────────────────────────────────────────
  const teacherData = [
    { name: 'Ahmed Al-Rashid', email: 'ahmed@school.edu', subject: 'Mathematics', department: 'STEM' },
    { name: 'Sarah Carter', email: 'sarah.carter@school.edu', subject: 'Physics', department: 'STEM' },
    { name: 'Emily Davis', email: 'emily.davis@school.edu', subject: 'English Literature', department: 'Humanities' },
    { name: 'Dr. James Lee', email: 'james.lee@school.edu', subject: 'World History', department: 'Humanities' },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { name: t.name, email: t.email, passwordHash: hash, role: Role.TEACHER, isActive: true },
    });
    const teacher = await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, subject: t.subject, department: t.department },
    });
    teachers.push({ user, teacher });
  }

  // ── Students ───────────────────────────────────────────────────────────────
  const studentData = [
    { name: 'Layla Hassan', email: 'layla.hassan@student.edu', gradeLevel: '9th Grade' },
    { name: 'Omar Hassan', email: 'omar.hassan@student.edu', gradeLevel: '7th Grade' },
    { name: 'Sarah Johnson', email: 'sarah.johnson@student.edu', gradeLevel: '11th Grade' },
    { name: 'Ahmed Malik', email: 'ahmed.malik@student.edu', gradeLevel: '10th Grade' },
    { name: 'Emma Wilson', email: 'emma.wilson@student.edu', gradeLevel: '11th Grade' },
    { name: 'James Chen', email: 'james.chen@student.edu', gradeLevel: '9th Grade' },
  ];

  const students = [];
  for (const s of studentData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { name: s.name, email: s.email, passwordHash: hash, role: Role.STUDENT, isActive: true },
    });
    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, gradeLevel: s.gradeLevel },
    });
    students.push({ user, student });
  }

  // ── Parent ─────────────────────────────────────────────────────────────────
  const parentUser = await prisma.user.upsert({
    where: { email: 'fatima.hassan@email.com' },
    update: {},
    create: { name: 'Fatima Hassan', email: 'fatima.hassan@email.com', passwordHash: hash, role: Role.PARENT, isActive: true },
  });
  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: { userId: parentUser.id },
  });
  // Link children
  for (const s of students.slice(0, 2)) {
    await prisma.parentStudent.upsert({
      where: { parentId_studentId: { parentId: parent.id, studentId: s.student.id } },
      update: {},
      create: { parentId: parent.id, studentId: s.student.id },
    });
  }

  // ── Courses ────────────────────────────────────────────────────────────────
  const courseData = [
    { title: 'Advanced Mathematics', description: 'Calculus, limits, derivatives, and integrals.', subject: 'Mathematics', gradeLevel: '11th Grade', teacherIdx: 0 },
    { title: 'Physics Fundamentals', description: 'Mechanics, thermodynamics, and electromagnetism.', subject: 'Physics', gradeLevel: '10th Grade', teacherIdx: 1 },
    { title: 'English Literature', description: 'Shakespeare, modern novels, and essay writing.', subject: 'English', gradeLevel: '9th Grade', teacherIdx: 2 },
    { title: 'World History', description: 'Ancient civilizations to modern geopolitics.', subject: 'History', gradeLevel: '10th Grade', teacherIdx: 3 },
  ];

  const courses = [];
  for (const c of courseData) {
    const course = await prisma.course.create({
      data: {
        title: c.title,
        description: c.description,
        subject: c.subject,
        gradeLevel: c.gradeLevel,
        teacherId: teachers[c.teacherIdx].teacher.id,
        status: 'PUBLISHED',
      },
    });
    courses.push(course);

    // Add chapters and lessons
    const chapter = await prisma.chapter.create({
      data: { courseId: course.id, title: 'Chapter 1: Introduction', order: 1 },
    });
    await prisma.lesson.createMany({
      data: [
        { chapterId: chapter.id, title: 'Overview', order: 1, type: 'VIDEO', duration: 10 },
        { chapterId: chapter.id, title: 'Core Concepts', order: 2, type: 'VIDEO', duration: 20 },
        { chapterId: chapter.id, title: 'Practice Problems', order: 3, type: 'PDF', duration: 5 },
      ],
    });
  }

  // ── Enrollments ────────────────────────────────────────────────────────────
  for (const student of students) {
    for (const course of courses.slice(0, 3)) {
      await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId: student.student.id, courseId: course.id } },
        update: {},
        create: { studentId: student.student.id, courseId: course.id, progress: Math.floor(Math.random() * 80) },
      });
    }
  }

  // ── Assignments ────────────────────────────────────────────────────────────
  const assignment = await prisma.assignment.create({
    data: {
      courseId: courses[0].id,
      title: 'Derivatives Practice Set',
      description: 'Complete all questions on differentiation rules.',
      totalPoints: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'PUBLISHED',
    },
  });
  await prisma.question.createMany({
    data: [
      { assignmentId: assignment.id, text: "What is the derivative of f(x) = x³ − 4x + 7?", type: 'MCQ', points: 25, order: 1, options: JSON.stringify(["3x² − 4", "3x² + 7", "x² − 4", "3x³ − 4"]), correctAnswer: '3x² − 4' },
      { assignmentId: assignment.id, text: 'Explain the chain rule with an example.', type: 'SHORT_ANSWER', points: 75, order: 2 },
    ],
  });

  // ── Live sessions ──────────────────────────────────────────────────────────
  await prisma.liveSession.create({
    data: {
      courseId: courses[0].id,
      teacherId: teachers[0].teacher.id,
      title: 'Chapter 2: Derivatives — Live Review',
      roomId: 'room-math-live-001',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  });

  // ── Notifications ──────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: students.slice(0, 3).map(s => ({
      userId: s.user.id,
      type: 'ASSIGNMENT',
      title: 'New Assignment Posted',
      body: 'Mr. Al-Rashid posted "Derivatives Practice Set" due in 7 days.',
      isRead: false,
    })),
  });

  console.log('✅ Seed complete!');
  console.log('\n📋 Demo accounts (all password: Password123!):');
  console.log('  Admin:   admin@eduai.platform');
  console.log('  Teacher: ahmed@school.edu');
  console.log('  Student: layla.hassan@student.edu');
  console.log('  Parent:  fatima.hassan@email.com');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
