import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Get('my-payments')
  @UseGuards(RolesGuard)
  @Roles('PARENT')
  getMyPayments(@CurrentUser() user: AuthUser) {
    return this.svc.getMyPayments(user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.svc.getAll(limit ? +limit : 100, offset ? +offset : 0);
  }
}
