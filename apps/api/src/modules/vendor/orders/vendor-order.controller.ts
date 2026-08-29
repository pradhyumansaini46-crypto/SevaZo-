import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { VendorOrderService } from './vendor-order.service';

@ApiTags('10. Vendor Order Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/orders')
export class VendorOrderController {
  constructor(private orderService: VendorOrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get authorized vendor orders filtered by stage tab' })
  @ApiQuery({ name: 'tab', enum: ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'HISTORY'] })
  listOrders(
    @CurrentVendor() vendor: any,
    @Query('tab') tab: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'HISTORY',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.orderService.listOrders(vendor.id, tab || 'NEW', Number(page) || 1, Number(limit) || 20);
  }

  @Get('live-stats')
  @ApiOperation({ summary: 'Get real-time order counter statistics for dashboard' })
  getLiveStats(@CurrentVendor() vendor: any) {
    return this.orderService.getLiveStats(vendor.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get authorized order details by ID' })
  getOrder(@CurrentVendor() vendor: any, @Param('id') id: string) {
    return this.orderService.getOrderDetails(vendor.id, id);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept new incoming order' })
  acceptOrder(@CurrentVendor() vendor: any, @Param('id') id: string) {
    return this.orderService.acceptOrder(vendor.id, id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject new incoming order with cancellation reason' })
  rejectOrder(
    @CurrentVendor() vendor: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.orderService.rejectOrder(vendor.id, id, reason);
  }

  @Patch(':id/preparing')
  @ApiOperation({ summary: 'Mark order as in-kitchen packing & preparing' })
  markPreparing(@CurrentVendor() vendor: any, @Param('id') id: string) {
    return this.orderService.markPreparing(vendor.id, id);
  }

  @Patch(':id/ready')
  @ApiOperation({ summary: 'Mark order ready for rider pickup' })
  markReady(@CurrentVendor() vendor: any, @Param('id') id: string) {
    return this.orderService.markReady(vendor.id, id);
  }
}
