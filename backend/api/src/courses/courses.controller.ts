import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.coursesService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      teacherId,
    });
  }

  @Get('my-enrollments')
  getMyEnrollments(@Request() req: { user: { sub: string } }) {
    return this.coursesService.getMyEnrollments(req.user.sub);
  }

  @Get('my-courses')
  getMyTeacherCourses(@Request() req: { user: { sub: string } }) {
    return this.coursesService.getMyTeacherCourses(req.user.sub);
  }

  @Post()
  create(
    @Body() body: { title: string; description?: string; subject?: string; gradeLevel?: string },
    @Request() req: { user: { sub: string } },
  ) {
    return this.coursesService.create(body, req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.coursesService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; status?: string },
    @Request() req: { user: { sub: string } },
  ) {
    return this.coursesService.update(id, body, req.user.sub);
  }

  @Post(':id/enroll')
  enroll(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.coursesService.enroll(id, req.user.sub);
  }
}
