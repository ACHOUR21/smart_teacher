import { Controller, Get, Post, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LiveSessionsService } from './live-sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('live-sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('live-sessions')
export class LiveSessionsController {
  constructor(private readonly liveSessionsService: LiveSessionsService) {}

  @Get()
  findAll(
    @Query('courseId') courseId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.liveSessionsService.findAll({
      courseId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Post()
  create(
    @Request() req: { user: { sub: string } },
    body: { courseId: string; title: string; scheduledAt?: string },
  ) {
    return this.liveSessionsService.create(body as never, req.user.sub);
  }

  @Patch(':id/start')
  start(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.liveSessionsService.startSession(id, req.user.sub);
  }

  @Patch(':id/end')
  end(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.liveSessionsService.endSession(id, req.user.sub);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.liveSessionsService.joinSession(id, req.user.sub);
  }
}
