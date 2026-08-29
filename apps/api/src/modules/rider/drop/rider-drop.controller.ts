import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderDropService } from './rider-drop.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 11. Drop Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/drop')
export class RiderDropController {
  constructor(private dropService: RiderDropService) {}

  @Post(':deliveryId/arrive')
  @ApiOperation({ summary: 'Signal arrival at customer doorstep location' })
  arriveAtCustomer(
    @CurrentRider() rider: any,
    @Param('deliveryId') deliveryId: string,
    @Body() body: { latitude?: number; longitude?: number },
  ) {
    return this.dropService.arriveAtCustomer(rider.id, deliveryId, body);
  }

  @Get(':deliveryId/contact')
  @ApiOperation({ summary: 'Get customer delivery instructions and contact details' })
  getCustomerContact(
    @CurrentRider() rider: any,
    @Param('deliveryId') deliveryId: string,
  ) {
    return this.dropService.getCustomerContact(rider.id, deliveryId);
  }
}
