import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';

@ApiTags('Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private service: CouponsService) {}

  @Get()
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'List all discount coupons' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Create discount coupon' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id/status')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Toggle coupon active status' })
  toggleActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.service.toggleActive(id, isActive);
  }
}
