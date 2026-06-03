import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly svc: CoursesService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('teacherId') teacherId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.svc.findAll({
      search, category, teacherId,
      isPublished: true,
      limit: limit ? +limit : 20,
      offset: offset ? +offset : 0,
    });
  }

  // Static routes must come before :id
  @Get('my-enrollments')
  getMyEnrollments(@CurrentUser() user: any) {
    return this.svc.getMyEnrollments(user.studentId);
  }

  @Get('my-courses')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  getMyTeacherCourses(@CurrentUser() user: any) {
    return this.svc.getMyTeacherCourses(user.teacherId);
  }

  @Get('my-certificates')
  getMyCertificates(@CurrentUser() user: any) {
    return this.svc.getMyCertificates(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.create(dto, user.teacherId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.svc.update(id, dto, user.teacherId);
  }

  @Post(':id/enroll')
  enroll(@Param('id') courseId: string, @CurrentUser() user: any) {
    return this.svc.enroll(courseId, user.studentId);
  }

  // Lesson progress tracking
  @Post(':courseId/lessons/:lessonId/complete')
  completeLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any,
  ) {
    return this.svc.completeLesson(courseId, lessonId, user.studentId);
  }

  @Get(':courseId/progress')
  getCourseProgress(@Param('courseId') courseId: string, @CurrentUser() user: any) {
    return this.svc.getCourseProgress(courseId, user.studentId);
  }

  // Chapter CRUD
  @Post(':courseId/chapters')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  createChapter(
    @Param('courseId') courseId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.svc.createChapter(courseId, dto, user.teacherId);
  }

  @Patch(':courseId/chapters/:chapterId')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  updateChapter(
    @Param('courseId') courseId: string,
    @Param('chapterId') chapterId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateChapter(courseId, chapterId, dto, user.teacherId);
  }

  @Delete(':courseId/chapters/:chapterId')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  deleteChapter(
    @Param('courseId') courseId: string,
    @Param('chapterId') chapterId: string,
    @CurrentUser() user: any,
  ) {
    return this.svc.deleteChapter(courseId, chapterId, user.teacherId);
  }

  // Lesson CRUD
  @Post(':courseId/chapters/:chapterId/lessons')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  createLesson(
    @Param('courseId') courseId: string,
    @Param('chapterId') chapterId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.svc.createLesson(courseId, chapterId, dto, user.teacherId);
  }

  @Patch(':courseId/chapters/:chapterId/lessons/:lessonId')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  updateLesson(
    @Param('courseId') courseId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateLesson(courseId, chapterId, lessonId, dto, user.teacherId);
  }

  @Delete(':courseId/chapters/:chapterId/lessons/:lessonId')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  deleteLesson(
    @Param('courseId') courseId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any,
  ) {
    return this.svc.deleteLesson(courseId, chapterId, lessonId, user.teacherId);
  }
}
