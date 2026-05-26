import {
  Controller, Get, Patch, Post, Delete,
  Param, Query, Body, UseGuards
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  getAll(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.svc.getForUser(user.id, {
      limit: limit ? +limit : 20,
      offset: offset ? +offset : 0,
    });
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any) {
    return this.svc.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.markRead(id, user.id);
  }

  @Patch('mark-all-read')
  markAllRead(@CurrentUser() user: any) {
    return this.svc.markAllRead(user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.delete(id, user.id);
  }
}
