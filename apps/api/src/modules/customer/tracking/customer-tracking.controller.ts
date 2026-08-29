import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerTrackingService } from './customer-tracking.service';

@ApiTags('Customer 8. Delivery Tracking Module')
@Controller('customer/tracking')
export class CustomerTrackingController {
  constructor(private service: CustomerTrackingService) {}

  @Get(':orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get live tracking data, rider location, ETA & OTP' })
  getTracking(@Param('orderId') orderId: string) {
    return this.service.getTracking(orderId);
  }

  @Post(':orderId/verify-otp')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify doorstep delivery OTP' })
  verifyOtp(
    @Param('orderId') orderId: string,
    @Body('otp') otp: string,
  ) {
    return this.service.verifyDeliveryOtp(orderId, otp);
  }
}
