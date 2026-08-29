import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderProfileService } from './rider-profile.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 2. Profile Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/profile')
export class RiderProfileController {
  constructor(private profileService: RiderProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get complete rider profile details' })
  getProfile(@CurrentRider() rider: any) {
    return this.profileService.getProfile(rider.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update personal rider profile details' })
  updateProfile(
    @CurrentRider() rider: any,
    @Body()
    body: {
      name?: string;
      email?: string;
      avatar?: string;
      zoneId?: string;
    },
  ) {
    return this.profileService.updateProfile(rider.id, body);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get rider performance, rating, and acceptance score' })
  getPerformance(@CurrentRider() rider: any) {
    return this.profileService.getPerformance(rider.id);
  }
}
