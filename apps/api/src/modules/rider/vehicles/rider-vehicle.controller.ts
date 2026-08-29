import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderVehicleService, RegisterVehicleDto } from './rider-vehicle.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

/**
 * Point 45: /api/v1/rider/vehicle/*
 * Point 46: PATCH /api/v1/rider/onboarding/vehicle
 */
@ApiTags('Rider 4. Vehicle Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/vehicle')
export class RiderVehicleController {
  constructor(private vehicleService: RiderVehicleService) {}

  @Get()
  @ApiOperation({ summary: 'List all vehicles registered under the authenticated rider' })
  getVehicles(@CurrentRider() rider: any) {
    return this.vehicleService.getVehicles(rider.id);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Prompt 08: GET /api/v1/rider/vehicle/documents' })
  getVehicleDocuments(@CurrentRider() rider: any) {
    return this.vehicleService.getVehicles(rider.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific vehicle details by ID' })
  getVehicle(@CurrentRider() rider: any, @Param('id') id: string) {
    return this.vehicleService.getVehicle(rider.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Point 46: Register a new vehicle with full validation pipeline' })
  registerVehicle(
    @CurrentRider() rider: any,
    @Body() dto: RegisterVehicleDto,
  ) {
    return this.vehicleService.registerVehicle(rider.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update existing vehicle details' })
  updateVehicle(
    @CurrentRider() rider: any,
    @Param('id') id: string,
    @Body() dto: Partial<RegisterVehicleDto>,
  ) {
    return this.vehicleService.updateVehicle(rider.id, id, dto);
  }

  @Patch(':id/primary')
  @ApiOperation({ summary: 'Set vehicle as primary active delivery vehicle' })
  setPrimary(@CurrentRider() rider: any, @Param('id') id: string) {
    return this.vehicleService.setPrimary(rider.id, id);
  }
}
