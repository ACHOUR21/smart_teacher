import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@ApiTags('assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly svc: AssignmentsService) {}

  @Get()
  findAll(
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.svc.findAll({ courseId, teacherId, search, limit: limit ? +limit : 20, offset: offset ? +offset : 0 });
  }

  // NOTE: must come before :id to avoid route collision
  @Get('my-assignments')
  getMyAssignments(@CurrentUser() user: AuthUser) {
    return this.svc.getMyStudentAssignments(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  create(@Body() dto: CreateAssignmentDto) {
    return this.svc.create(dto);
  }

  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.svc.submit(id, user.id, dto.answers);
  }

  @Get(':id/submissions')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  getSubmissions(@Param('id') id: string) {
    return this.svc.getSubmissions(id);
  }

  @Patch(':id/submissions/:sid/grade')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  grade(
    @Param('id') assignmentId: string,
    @Param('sid') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.svc.gradeSubmission(assignmentId, submissionId, dto);
  }
}
