import {
  Controller, Get, Patch, Param, Query, Body,
  UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  findAll(
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.svc.findAll({ role, search, limit: limit ? +limit : 20, offset: offset ? +offset : 0 });
  }

  // Static routes must come before :id
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getStats() {
    return this.svc.getStats();
  }

  @Get('my-children')
  @UseGuards(RolesGuard)
  @Roles('PARENT')
  getMyChildren(@CurrentUser() user: any) {
    return this.svc.getMyChildren(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    if (user.role !== 'ADMIN' && user.id !== id) {
      return { error: 'Forbidden' };
    }
    return this.svc.update(id, body);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.svc.setActive(id, isActive);
  }
}
