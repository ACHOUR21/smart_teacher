import {
  Controller, Get, Patch, Param, Body, Query,
  UseGuards, Request, ParseBoolPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req: { user: { sub: string; role: string } }) {
    return this.usersService.findOne(req.user.sub);
  }

  @Patch('me')
  updateProfile(
    @Request() req: { user: { sub: string } },
    @Body() body: { name?: string; avatarUrl?: string },
  ) {
    return this.usersService.updateProfile(req.user.sub, body);
  }

  @Get('me/stats')
  getMyStats(@Request() req: { user: { sub: string; role: string } }) {
    return this.usersService.getStats(req.user.sub, req.user.role as never);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      role: role as never,
      search,
    });
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  setStatus(
    @Param('id') id: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
    @Request() req: { user: { sub: string } },
  ) {
    return this.usersService.setActive(id, isActive, req.user.sub);
  }
}
