import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderLocationService, RiderGpsPingDto } from './rider-location.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 8. Location Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/location')
export class RiderLocationController {
  constructor(private locationService: RiderLocationService) {}

  @Post('update')
  @ApiOperation({ summary: 'Ingest live GPS location telemetry into Redis stream and breadcrumb cache' })
  updateLocation(
    @CurrentRider() rider: any,
    @Body() body: RiderGpsPingDto,
  ) {
    return this.locationService.ingestGpsPing(rider.id, body);
  }

  @Get('live')
  @ApiOperation({ summary: 'Get current fast in-memory/Redis live telemetry coordinates' })
  getLiveLocation(@CurrentRider() rider: any) {
    const live = this.locationService.getLiveRiderLocation(rider.id);
    return live || {
      riderId: rider.id,
      latitude: rider.currentLat,
      longitude: rider.currentLng,
      source: 'database_fallback',
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get recent historical GPS telemetry trail from PostgreSQL' })
  getRecentLocations(
    @CurrentRider() rider: any,
    @Query('limit') limit?: number,
  ) {
    return this.locationService.getRecentLocations(rider.id, limit ? +limit : 50);
  }
}
