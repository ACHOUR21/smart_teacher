import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
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

  @Get('teacher/weekly-engagement')
  @Roles('TEACHER')
  getTeacherWeeklyEngagement(
    @Request() req: any,
    @Query('weeks') weeks?: string,
  ) {
    return this.analyticsService.getTeacherWeeklyEngagement(
      req.user.sub,
      weeks ? +weeks : 8,
    );
  }

  @Get('admin')
  @Roles('ADMIN')
  getAdminAnalytics() {
    return this.analyticsService.getAdminAnalytics();
  }

  @Get('admin/weekly-engagement')
  @Roles('ADMIN')
  getAdminWeeklyEngagement(@Query('weeks') weeks?: string) {
    return this.analyticsService.getAdminWeeklyEngagement(weeks ? +weeks : 6);
  }

  @Get('admin/completion-by-category')
  @Roles('ADMIN')
  getCourseCompletionByCategory() {
    return this.analyticsService.getCourseCompletionByCategory();
  }

  @Get('student')
  @Roles('STUDENT')
  getStudentAnalytics(@Request() req: any) {
    return this.analyticsService.getStudentAnalytics(req.user.sub);
  }

  @Get('audit-logs')
  @Roles('ADMIN')
  getAuditLogs(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.analyticsService.getAuditLogs(
      limit ? +limit : 50,
      offset ? +offset : 0,
    );
  }
}
