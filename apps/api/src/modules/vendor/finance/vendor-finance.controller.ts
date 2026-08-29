import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { VendorFinanceService } from './vendor-finance.service';

@ApiTags('12. Vendor Finance Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/finance')
export class VendorFinanceController {
  constructor(private financeService: VendorFinanceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get total earnings, 10% platform commission and payout splits' })
  getSummary(@CurrentVendor() vendor: any) {
    return this.financeService.getFinanceSummary(vendor.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get itemized transaction ledger per order' })
  getTransactions(
    @CurrentVendor() vendor: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.financeService.getTransactions(vendor.id, Number(page) || 1, Number(limit) || 20);
  }
}
