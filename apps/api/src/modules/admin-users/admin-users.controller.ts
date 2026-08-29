import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admins')
export class AdminUsersController {
  constructor(private service: AdminUsersService) {}

  @Get()
  @RequirePermissions('admins:read')
  @ApiOperation({ summary: 'Get all admin users' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  @RequirePermissions('admins:write')
  @ApiOperation({ summary: 'Create new admin user' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id/status')
  @RequirePermissions('admins:write')
  @ApiOperation({ summary: 'Update admin status' })
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.service.updateStatus(id, status);
  }
}
