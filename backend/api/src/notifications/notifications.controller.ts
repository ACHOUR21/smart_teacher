import { Controller, Get, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getAll(
    @Request() req: { user: { sub: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getForUser(
      req.user.sub,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get('unread-count')
  getUnreadCount(@Request() req: { user: { sub: string } }) {
    return this.notificationsService.getUnreadCount(req.user.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.notificationsService.markRead(id, req.user.sub);
  }

  @Patch('read-all')
  markAllRead(@Request() req: { user: { sub: string } }) {
    return this.notificationsService.markAllRead(req.user.sub);
  }
}
