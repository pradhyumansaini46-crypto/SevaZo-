import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderPreferencesService, SavePreferencesDto } from './rider-preferences.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 9. Delivery Preferences')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/preferences')
export class RiderPreferencesController {
  constructor(private preferencesService: RiderPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get rider delivery preferences' })
  getPreferences(@CurrentRider() rider: any) {
    return this.preferencesService.getPreferences(rider.id);
  }

  @Post()
  @ApiOperation({ summary: 'Save rider delivery preferences (categories, radius, working hours)' })
  savePreferences(@CurrentRider() rider: any, @Body() dto: SavePreferencesDto) {
    return this.preferencesService.savePreferences(rider.id, dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Prompt 10: PATCH /api/v1/rider/preferences' })
  updatePreferences(@CurrentRider() rider: any, @Body() dto: SavePreferencesDto) {
    return this.preferencesService.savePreferences(rider.id, dto);
  }
}
