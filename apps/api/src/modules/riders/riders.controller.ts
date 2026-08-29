import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RidersService } from './riders.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@ApiTags('Rider Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('riders')
export class RidersController {
  constructor(private service: RidersService) {}

  @Get()
  @RequirePermissions('riders:read')
  @ApiOperation({ summary: 'List all delivery riders and online fleet' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get('pending-approvals')
  @RequirePermissions('riders:read')
  @ApiOperation({ summary: 'Get all riders pending document verification and onboarding approval' })
  getPendingApprovals() {
    return this.service.getPendingApprovals();
  }

  @Get(':id')
  @RequirePermissions('riders:read')
  @ApiOperation({ summary: 'Get rider profile, vehicle, and documents' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/approve')
  @RequirePermissions('riders:write')
  @ApiOperation({ summary: 'Approve rider onboarding verification' })
  approveRider(@Param('id') id: string) {
    return this.service.updateApproval(id, 'APPROVED');
  }

  @Post(':id/reject')
  @RequirePermissions('riders:write')
  @ApiOperation({ summary: 'Reject rider onboarding verification' })
  rejectRider(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.service.updateApproval(id, 'REJECTED', reason);
  }

  @Patch(':id/approval')
  @RequirePermissions('riders:write')
  @ApiOperation({ summary: 'Approve or reject rider onboarding application' })
  updateApproval(
    @Param('id') id: string,
    @Body('approvalStatus') approvalStatus: any,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.service.updateApproval(id, approvalStatus, rejectionReason);
  }

  @Patch(':id/zone')
  @RequirePermissions('riders:write')
  @ApiOperation({ summary: 'Assign rider delivery zone' })
  updateZone(@Param('id') id: string, @Body('zoneId') zoneId: string) {
    return this.service.updateZone(id, zoneId);
  }
}
