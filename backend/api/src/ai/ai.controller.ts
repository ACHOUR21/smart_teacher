import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('sessions')
  createSession(
    @Body() body: { title?: string; courseId?: string },
    @Request() req: { user: { sub: string } },
  ) {
    return this.aiService.createSession(req.user.sub, body.title, body.courseId);
  }

  @Get('sessions')
  getSessions(@Request() req: { user: { sub: string } }) {
    return this.aiService.getSessions(req.user.sub);
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.aiService.getSession(id, req.user.sub);
  }

  @Post('sessions/:id/chat')
  chat(
    @Param('id') id: string,
    @Body('message') message: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.aiService.chat(id, req.user.sub, message);
  }

  @Post('generate/lesson')
  generateLesson(@Body() dto: { topic: string; gradeLevel?: string; duration?: number }) {
    return this.aiService.generateLesson(dto);
  }

  @Post('generate/quiz')
  generateQuiz(@Body() dto: { topic: string; questionCount?: number; difficulty?: string }) {
    return this.aiService.generateQuiz(dto);
  }

  @Post('generate/summary')
  generateSummary(@Body() dto: { content: string }) {
    return this.aiService.generateSummary(dto.content);
  }

  @Post('generate/mindmap')
  generateMindMap(@Body() dto: { topic: string }) {
    return this.aiService.generateMindMap(dto.topic);
  }
}
