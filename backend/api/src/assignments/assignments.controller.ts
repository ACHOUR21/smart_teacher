import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AssignmentsService } from './assignments.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@ApiTags('assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List assignments' })
  findAll(@Query() query: any) {
    return this.assignmentsService.findAll(query)
  }

  @Get('my/student')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get my assignments (student)' })
  myAssignments(@Req() req: any) {
    return this.assignmentsService.getMyStudentAssignments(req.user.sub)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Create assignment' })
  create(@Req() req: any, @Body() body: any) {
    return this.assignmentsService.create(req.user.sub, body)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Update assignment' })
  update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.assignmentsService.update(id, req.user.sub, body)
  }

  @Post(':id/submit')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Submit assignment answers' })
  submit(@Param('id') id: string, @Req() req: any, @Body() body: { answers: any }) {
    return this.assignmentsService.submit(id, req.user.sub, body.answers)
  }

  @Get(':id/submissions')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Get all submissions for an assignment' })
  submissions(@Param('id') id: string) {
    return this.assignmentsService.getSubmissions(id)
  }

  @Patch('submissions/:id/grade')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Grade a submission manually' })
  grade(@Param('id') id: string, @Body() body: { score: number; feedback: string }) {
    return this.assignmentsService.gradeSubmission(id, body.score, body.feedback)
  }
}
