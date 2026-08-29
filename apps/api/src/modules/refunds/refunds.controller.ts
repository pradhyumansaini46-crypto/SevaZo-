import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RefundsService } from './refunds.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@ApiTags('Refund Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('refunds')
export class RefundsController {
  constructor(private service: RefundsService) {}

  @Get()
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'List customer refund requests' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Create or initiate customer refund request' })
  createRefund(@Body() body: any) {
    return this.service.createRefund(body);
  }

  @Patch(':id/process')
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Approve and process refund request' })
  processRefund(
    @Param('id') id: string,
    @Body('status') status: any,
    @Body('notes') notes: string,
    @CurrentUser() admin: any,
  ) {
    return this.service.processRefund(id, status, admin?.id, notes);
  }
}
