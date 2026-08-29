import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { VendorAnalyticsService } from './vendor-analytics.service';

@ApiTags('15. Vendor Analytics Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/analytics')
export class VendorAnalyticsController {
  constructor(private analyticsService: VendorAnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get operational KPIs, 7-day revenue trends & best sellers' })
  getAnalytics(@CurrentVendor() vendor: any) {
    return this.analyticsService.getAnalytics(vendor.id);
  }
}
