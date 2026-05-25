import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CoursesService } from './courses.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List courses' })
  findAll(@Query() query: any) {
    return this.coursesService.findAll(query)
  }

  @Get('my/teacher')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Get my courses (teacher)' })
  myTeacherCourses(@Req() req: any) {
    return this.coursesService.getMyTeacherCourses(req.user.sub)
  }

  @Get('my/student')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get my enrolled courses (student)' })
  myStudentCourses(@Req() req: any) {
    return this.coursesService.getMyStudentCourses(req.user.sub)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Create a new course' })
  create(@Req() req: any, @Body() body: any) {
    return this.coursesService.create(req.user.sub, body)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Update course' })
  update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.coursesService.update(id, req.user.sub, body)
  }

  @Post(':id/enroll')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Enroll in a course' })
  enroll(@Param('id') id: string, @Req() req: any) {
    return this.coursesService.enroll(id, req.user.sub)
  }
}
