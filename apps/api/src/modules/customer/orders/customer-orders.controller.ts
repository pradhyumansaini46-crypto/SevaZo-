import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerOrdersService } from './customer-orders.service';

@ApiTags('Customer 6. Orders Module')
@Controller('customer/orders')
export class CustomerOrdersController {
  constructor(private service: CustomerOrdersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place new order from cart' })
  placeOrder(@Req() req: any, @Body() body: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.placeOrder(customerId, body);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active & past order history' })
  getOrders(@Req() req: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getOrders(customerId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details by order ID with ownership verification' })
  getOrderById(@Req() req: any, @Param('id') id: string) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.getOrderById(customerId, id);
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel order and trigger refund' })
  cancelOrder(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.cancelOrder(customerId, id, reason);
  }

  @Post(':id/return')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request return for delivered order' })
  requestReturn(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('items') items: any[],
  ) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.requestReturn(customerId, id, reason, items);
  }
}
