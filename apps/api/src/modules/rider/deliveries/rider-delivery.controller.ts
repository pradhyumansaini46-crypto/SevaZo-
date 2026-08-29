import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderDeliveryService } from './rider-delivery.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 6. Delivery Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/deliveries')
export class RiderDeliveryController {
  constructor(private deliveryService: RiderDeliveryService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get current active ongoing delivery trip' })
  getActiveDelivery(@CurrentRider() rider: any) {
    return this.deliveryService.getActiveDelivery(rider.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get completed and past deliveries history' })
  getDeliveryHistory(
    @CurrentRider() rider: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.deliveryService.getDeliveryHistory(
      rider.id,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed delivery information' })
  getDeliveryDetails(@CurrentRider() rider: any, @Param('id') id: string) {
    return this.deliveryService.getDeliveryDetails(rider.id, id);
  }

  @Post(':id/return-required')
  @ApiOperation({ summary: 'Signal package return required (customer unavailable/refused)' })
  markReturnRequired(
    @CurrentRider() rider: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.deliveryService.markReturnRequired(rider.id, id, reason);
  }

  @Post(':id/returned')
  @ApiOperation({ summary: 'Confirm package returned back to vendor store' })
  markReturned(
    @CurrentRider() rider: any,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    return this.deliveryService.markReturned(rider.id, id, notes);
  }

  @Post(':id/failed')
  @ApiOperation({ summary: 'Mark delivery failed with reason' })
  markFailed(
    @CurrentRider() rider: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.deliveryService.markFailed(rider.id, id, reason);
  }
}
