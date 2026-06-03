import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LiveSessionsService } from './live-sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';

@ApiTags('live-sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('live-sessions')
export class LiveSessionsController {
  constructor(private readonly svc: LiveSessionsService) {}

  @Get()
  findAll(
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.svc.findAll({ courseId, teacherId, status, limit: limit ? +limit : 20, offset: offset ? +offset : 0 });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  create(@Body() dto: { title: string; courseId: string; scheduledAt?: Date }, @CurrentUser() user: AuthUser) {
    return this.svc.create(dto, user.teacherId);
  }

  @Patch(':id/start')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  start(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.svc.startSession(id, user.teacherId);
  }

  @Patch(':id/end')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  end(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.svc.endSession(id, user.teacherId);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.svc.joinSession(id, user.studentId);
  }
}
