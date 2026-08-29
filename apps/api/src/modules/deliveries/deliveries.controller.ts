import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@ApiTags('Delivery Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private service: DeliveriesService) {}

  @Get()
  @RequirePermissions('logistics:read')
  @ApiOperation({ summary: 'List all deliveries and dispatch jobs' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Patch(':id/assign')
  @RequirePermissions('logistics:write')
  @ApiOperation({ summary: 'Assign or reassign rider to delivery' })
  assignRider(@Param('id') id: string, @Body('riderId') riderId: string) {
    return this.service.assignRider(id, riderId);
  }

  @Get('zones')
  @RequirePermissions('logistics:read')
  @ApiOperation({ summary: 'List all operational delivery zones' })
  getZones() {
    return this.service.getZones();
  }

  @Post('zones')
  @RequirePermissions('logistics:write')
  @ApiOperation({ summary: 'Create new delivery zone polygon' })
  createZone(@Body() body: any) {
    return this.service.createZone(body);
  }
}
