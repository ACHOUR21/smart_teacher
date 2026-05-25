import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { LiveSessionsService } from './live-sessions.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@ApiTags('live-sessions')
@Controller('live-sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LiveSessionsController {
  constructor(private readonly liveSessionsService: LiveSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'List live sessions' })
  findAll(@Query() query: any) {
    return this.liveSessionsService.findAll(query)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Create a live session' })
  create(@Req() req: any, @Body() body: any) {
    return this.liveSessionsService.create(req.user.sub, body)
  }

  @Post(':id/start')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Start a live session' })
  start(@Param('id') id: string, @Req() req: any) {
    return this.liveSessionsService.startSession(id, req.user.sub)
  }

  @Post(':id/end')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'End a live session' })
  end(@Param('id') id: string, @Req() req: any) {
    return this.liveSessionsService.endSession(id, req.user.sub)
  }

  @Post(':id/join')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Join a live session (student)' })
  join(@Param('id') id: string, @Req() req: any) {
    return this.liveSessionsService.joinSession(id, req.user.sub)
  }
}
