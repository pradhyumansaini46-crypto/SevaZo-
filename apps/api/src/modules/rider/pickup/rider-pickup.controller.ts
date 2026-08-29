import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderPickupService, VerifyPickupDto } from './rider-pickup.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 10. Pickup Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/pickup')
export class RiderPickupController {
  constructor(private pickupService: RiderPickupService) {}

  @Post(':deliveryId/arrive')
  @ApiOperation({ summary: 'Signal arrival at vendor / store' })
  arriveAtVendor(
    @CurrentRider() rider: any,
    @Param('deliveryId') deliveryId: string,
    @Body() body: { latitude?: number; longitude?: number },
  ) {
    return this.pickupService.arriveAtVendor(rider.id, deliveryId, body);
  }

  @Post(':deliveryId/verify')
  @ApiOperation({ summary: 'Verify vendor pickup with Order ID + (Vendor OTP OR QR Code) + checklist confirmation' })
  verifyPickup(
    @CurrentRider() rider: any,
    @Param('deliveryId') deliveryId: string,
    @Body() body: VerifyPickupDto,
  ) {
    return this.pickupService.verifyPickup(rider.id, deliveryId, body);
  }
}
