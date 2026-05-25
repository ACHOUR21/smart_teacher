import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AIService } from './ai.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('sessions')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Create new AI tutor session' })
  createSession(@Req() req: any, @Body() body: { subject?: string }) {
    return this.aiService.createSession(req.user.sub, body.subject)
  }

  @Get('sessions')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get my AI sessions' })
  getSessions(@Req() req: any) {
    return this.aiService.getSessions(req.user.sub)
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a specific AI session with messages' })
  getSession(@Param('id') id: string) {
    return this.aiService.getSession(id)
  }

  @Post('sessions/:id/chat')
  @ApiOperation({ summary: 'Send a message in an AI session' })
  chat(@Param('id') id: string, @Body() body: { message: string }) {
    return this.aiService.chat(id, body.message)
  }

  @Post('generate/lesson')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Generate a lesson plan with AI' })
  generateLesson(@Body() body: { topic: string; grade: string; duration: number; language: string }) {
    return this.aiService.generateLesson(body)
  }

  @Post('generate/quiz')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Generate a quiz with AI' })
  generateQuiz(@Body() body: { topic: string; count: number; difficulty: string }) {
    return this.aiService.generateQuiz(body)
  }

  @Post('generate/summary')
  @ApiOperation({ summary: 'Generate a summary with AI' })
  generateSummary(@Body() body: { text: string }) {
    return this.aiService.generateSummary(body.text)
  }

  @Post('generate/mindmap')
  @ApiOperation({ summary: 'Generate a mind map with AI' })
  generateMindMap(@Body() body: { topic: string }) {
    return this.aiService.generateMindMap(body.topic)
  }
}
