import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly svc: MessagesService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.svc.getConversations(req.user.sub);
  }

  @Post('conversations')
  getOrCreate(@Request() req: any, @Body('userId') userId: string) {
    return this.svc.getOrCreateConversation(req.user.sub, userId);
  }

  @Get('conversations/:id')
  getMessages(
    @Param('id') conversationId: string,
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.svc.getMessages(conversationId, req.user.sub, limit ? +limit : 50, before);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') conversationId: string,
    @Request() req: any,
    @Body('content') content: string,
  ) {
    return this.svc.sendMessage(conversationId, req.user.sub, content);
  }
}
