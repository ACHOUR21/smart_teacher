import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('teacher')
  @Roles('TEACHER')
  getTeacherAnalytics(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getTeacherAnalytics(user.id);
  }

  @Get('teacher/weekly-engagement')
  @Roles('TEACHER')
  getTeacherWeeklyEngagement(
    @CurrentUser() user: AuthUser,
    @Query('weeks') weeks?: string,
  ) {
    return this.analyticsService.getTeacherWeeklyEngagement(
      user.id,
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
  getStudentAnalytics(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getStudentAnalytics(user.id);
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
