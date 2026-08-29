import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { VendorPromotionService } from './vendor-promotion.service';

@ApiTags('14. Vendor Promotion Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/promotions')
export class VendorPromotionController {
  constructor(private promoService: VendorPromotionService) {}

  @Get()
  @ApiOperation({ summary: 'Get active store promotional coupons and banners' })
  getPromotions(@CurrentVendor() vendor: any) {
    return this.promoService.getPromotions(vendor.id);
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create store promotional discount voucher' })
  createCoupon(@CurrentVendor() vendor: any, @Body() dto: any) {
    return this.promoService.createCoupon(vendor.id, dto);
  }
}
