import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderAddressService, SaveAddressDto } from './rider-address.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 6. Address Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/address')
export class RiderAddressController {
  constructor(private addressService: RiderAddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get rider residential address' })
  getAddress(@CurrentRider() rider: any) {
    return this.addressService.getAddress(rider.id);
  }

  @Post()
  @ApiOperation({ summary: 'Save or update rider residential address' })
  saveAddress(@CurrentRider() rider: any, @Body() dto: SaveAddressDto) {
    return this.addressService.saveAddress(rider.id, dto);
  }
}
