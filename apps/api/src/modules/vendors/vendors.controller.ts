import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@ApiTags('Vendor Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('vendors')
export class VendorsController {
  constructor(private service: VendorsService) {}

  @Get()
  @RequirePermissions('vendors:read')
  @ApiOperation({ summary: 'List all vendors with documents' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('vendors:read')
  @ApiOperation({ summary: 'Get vendor store details and KYC' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/approve')
  @RequirePermissions('vendors:write')
  @ApiOperation({ summary: 'Approve vendor onboarding KYC' })
  approveVendor(@Param('id') id: string) {
    return this.service.updateApproval(id, 'APPROVED');
  }

  @Post(':id/reject')
  @RequirePermissions('vendors:write')
  @ApiOperation({ summary: 'Reject vendor onboarding KYC' })
  rejectVendor(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.service.updateApproval(id, 'REJECTED', reason);
  }

  @Patch(':id/approval')
  @RequirePermissions('vendors:write')
  @ApiOperation({ summary: 'Approve or reject vendor KYC application' })
  updateApproval(
    @Param('id') id: string,
    @Body('approvalStatus') approvalStatus: any,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.service.updateApproval(id, approvalStatus, rejectionReason);
  }

  @Patch(':id/commission')
  @RequirePermissions('vendors:write')
  @ApiOperation({ summary: 'Update vendor commission percentage' })
  updateCommission(@Param('id') id: string, @Body('commissionRate') commissionRate: number) {
    return this.service.updateCommission(id, commissionRate);
  }
}
