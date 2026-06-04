import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly svc: MessagesService) {}

  @Get('conversations')
  getConversations(@CurrentUser() user: AuthUser) {
    return this.svc.getConversations(user.id);
  }

  @Post('conversations')
  getOrCreate(@CurrentUser() user: AuthUser, @Body('userId') userId: string) {
    return this.svc.getOrCreateConversation(user.id, userId);
  }

  @Get('conversations/:id')
  getMessages(
    @Param('id') conversationId: string,
    @CurrentUser() user: AuthUser,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.svc.getMessages(conversationId, user.id, limit ? +limit : 50, before);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') conversationId: string,
    @CurrentUser() user: AuthUser,
    @Body('content') content: string,
  ) {
    return this.svc.sendMessage(conversationId, user.id, content);
  }
}
