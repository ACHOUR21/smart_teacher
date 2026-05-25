import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('courseId') courseId?: string,
    @Request() req?: { user: { sub: string } },
  ) {
    return this.assignmentsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      courseId,
    });
  }

  @Get('mine')
  getMyAssignments(@Request() req: { user: { sub: string } }) {
    return this.assignmentsService.getMyStudentAssignments(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Post()
  create(
    @Body() body: {
      courseId: string;
      title: string;
      description?: string;
      dueDate?: string;
      totalPoints?: number;
      questions?: Array<{
        text: string;
        type: string;
        points: number;
        options?: string[];
        correctAnswer?: string;
      }>;
    },
    @Request() req: { user: { sub: string } },
  ) {
    return this.assignmentsService.create(body as never, req.user.sub);
  }

  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @Body('answers') answers: Record<string, string>,
    @Request() req: { user: { sub: string } },
  ) {
    return this.assignmentsService.submit(id, req.user.sub, answers);
  }

  @Get(':id/submissions')
  getSubmissions(@Param('id') id: string) {
    return this.assignmentsService.getSubmissions(id);
  }

  @Patch('submissions/:submissionId/grade')
  gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() body: { score: number; feedback?: string },
  ) {
    return this.assignmentsService.gradeSubmission(submissionId, body.score, body.feedback);
  }
}
