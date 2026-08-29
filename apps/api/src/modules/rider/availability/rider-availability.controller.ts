import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderAvailabilityService } from './rider-availability.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 5. Availability Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/availability')
export class RiderAvailabilityController {
  constructor(private availabilityService: RiderAvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'Prompt 11: GET /api/v1/rider/availability — Get rider weekly shift availability schedule' })
  getSchedule(@CurrentRider() rider: any) {
    return this.availabilityService.getSchedule(rider.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Prompt 11: PATCH /api/v1/rider/availability — Update rider weekly shift availability schedule' })
  updateSchedule(@CurrentRider() rider: any, @Body() body: any) {
    return this.availabilityService.updateSchedule(rider.id, body);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current rider duty status, shift duration & active stats' })
  getStatus(@CurrentRider() rider: any) {
    return this.availabilityService.getStatus(rider.id);
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle Rider status Online / Offline' })
  toggleOnline(
    @CurrentRider() rider: any,
    @Body()
    body: {
      isOnline: boolean;
      batteryPercentage?: number;
      deviceInfo?: any;
      latitude?: number;
      longitude?: number;
    },
  ) {
    return this.availabilityService.toggleOnline(rider.id, body);
  }

  @Post('heartbeat')
  @ApiOperation({ summary: 'Send battery & telemetry heartbeat ping' })
  heartbeat(
    @CurrentRider() rider: any,
    @Body()
    body: {
      batteryPercentage?: number;
      latitude?: number;
      longitude?: number;
      heading?: number;
      speed?: number;
    },
  ) {
    return this.availabilityService.heartbeat(rider.id, body);
  }
}
