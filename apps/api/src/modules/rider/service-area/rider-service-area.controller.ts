import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderServiceAreaService, SaveServiceAreaDto } from './rider-service-area.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 8. Service Area')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/service-area')
export class RiderServiceAreaController {
  constructor(private serviceAreaService: RiderServiceAreaService) {}

  @Get()
  @ApiOperation({ summary: 'Get rider preferred service area and zones' })
  getServiceArea(@CurrentRider() rider: any) {
    return this.serviceAreaService.getServiceArea(rider.id);
  }

  @Post()
  @ApiOperation({ summary: 'Save rider preferred service area and delivery zones' })
  saveServiceArea(@CurrentRider() rider: any, @Body() dto: SaveServiceAreaDto) {
    return this.serviceAreaService.saveServiceArea(rider.id, dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Prompt 10: PATCH /api/v1/rider/service-area' })
  updateServiceArea(@CurrentRider() rider: any, @Body() dto: SaveServiceAreaDto) {
    return this.serviceAreaService.saveServiceArea(rider.id, dto);
  }
}
