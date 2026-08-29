import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { SettlementService } from './settlement.service';

@ApiTags('13. Settlement Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/settlements')
export class SettlementController {
  constructor(private settlementService: SettlementService) {}

  @Get()
  @ApiOperation({ summary: 'List weekly bank settlement statements with UTR tracking' })
  listSettlements(@CurrentVendor() vendor: any) {
    return this.settlementService.listSettlements(vendor.id);
  }
}
