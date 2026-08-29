import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';

@ApiTags('Platform Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  @Get()
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get all platform settings and parameters' })
  findAll() {
    return this.service.findAll();
  }

  @Put()
  @RequirePermissions('settings:write')
  @ApiOperation({ summary: 'Update system setting key' })
  update(@Body('key') key: string, @Body('value') value: string, @Body('description') description?: string) {
    return this.service.update(key, value, description);
  }
}
