import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerCheckoutService } from './customer-checkout.service';

@ApiTags('Customer 5. Checkout Module')
@Controller('customer/checkout')
export class CustomerCheckoutController {
  constructor(private service: CustomerCheckoutService) {}

  @Post('calculate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate bill breakdown (item total, delivery, tax, discount)' })
  calculate(
    @Req() req: any,
    @Body('addressId') addressId?: string,
    @Body('couponCode') couponCode?: string,
  ) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.calculateBill(customerId, addressId, couponCode);
  }

  @Get('coupons')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List applicable discount vouchers & promo codes' })
  getCoupons(@Query('itemTotal') itemTotal?: string) {
    const total = itemTotal ? parseFloat(itemTotal) : 300;
    return this.service.getAvailableCoupons(total);
  }
}
