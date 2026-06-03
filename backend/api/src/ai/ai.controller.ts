import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
  constructor(private readonly svc: AIService) {}

  @Post('sessions')
  createSession(@Body() body: { title: string }, @CurrentUser() user: AuthUser) {
    return this.svc.createSession(user.id, body.title ?? 'New Chat');
  }

  @Get('sessions')
  getSessions(@CurrentUser() user: AuthUser) {
    return this.svc.getSessions(user.id);
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string) {
    return this.svc.getSession(id);
  }

  @Post('sessions/:id/chat')
  chat(
    @Param('id') id: string,
    @Body() body: { message: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.svc.chat(id, user.id, body.message);
  }

  @Post('generate/lesson')
  generateLesson(@Body() body: { topic: string; grade?: string; duration?: number }) {
    return this.svc.generateLesson(body.topic, body.grade, body.duration);
  }

  @Post('generate/quiz')
  generateQuiz(@Body() body: { topic: string; count?: number }) {
    return this.svc.generateQuiz(body.topic, body.count);
  }

  @Post('generate/summary')
  generateSummary(@Body() body: { text: string }) {
    return this.svc.generateSummary(body.text);
  }

  @Post('generate/mindmap')
  generateMindMap(@Body() body: { topic: string }) {
    return this.svc.generateMindMap(body.topic);
  }
}
