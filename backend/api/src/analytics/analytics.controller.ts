import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('teacher')
  @Roles('TEACHER')
  getTeacherAnalytics(@Request() req: any) {
    return this.analyticsService.getTeacherAnalytics(req.user.sub);
  }

  @Get('admin')
  @Roles('ADMIN')
  getAdminAnalytics() {
    return this.analyticsService.getAdminAnalytics();
  }

  @Get('student')
  @Roles('STUDENT')
  getStudentAnalytics(@Request() req: any) {
    return this.analyticsService.getStudentAnalytics(req.user.sub);
  }
}
