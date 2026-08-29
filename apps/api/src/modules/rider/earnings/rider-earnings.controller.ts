import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderEarningsService } from './rider-earnings.service';
import { RiderAuthGuard } from '../common/rider-auth.guard';
import { CurrentRider } from '../common/rider.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Rider 13. Earnings Module')
@ApiBearerAuth()
@Public()
@UseGuards(RiderAuthGuard)
@Controller('rider/earnings')
export class RiderEarningsController {
  constructor(private earningsService: RiderEarningsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get total wallet balance, today and weekly earnings summary' })
  getEarningsSummary(@CurrentRider() rider: any) {
    return this.earningsService.getEarningsSummary(rider.id);
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Get itemized trip earnings ledger and payout history' })
  getEarningsLedger(
    @CurrentRider() rider: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.earningsService.getEarningsLedger(
      rider.id,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }
}
