import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderSettlementService } from './rider-settlement.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 14. Settlement Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/settlements')
export class RiderSettlementController {
  constructor(private settlementService: RiderSettlementService) {}

  @Get()
  @ApiOperation({ summary: 'Get rider settlement and payout history' })
  getSettlements(@CurrentRider() rider: any) {
    return this.settlementService.getSettlements(rider.id);
  }

  @Post('request-payout')
  @ApiOperation({ summary: 'Request instant wallet payout / bank withdrawal' })
  requestPayout(
    @CurrentRider() rider: any,
    @Body() body: { amount: number; upiId?: string },
  ) {
    return this.settlementService.requestPayout(rider.id, body.amount, body.upiId);
  }
}
