import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { TrackingService } from './tracking.service';

@ApiTags('Rider 9. Tracking Module')
@Controller('rider/tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Public()
  @Get(':deliveryId')
  @ApiOperation({ summary: 'Get live tracking coordinates, breadcrumbs & ETA for customer/admin' })
  getDeliveryTracking(@Param('deliveryId') deliveryId: string) {
    return this.trackingService.getDeliveryTracking(deliveryId);
  }
}
