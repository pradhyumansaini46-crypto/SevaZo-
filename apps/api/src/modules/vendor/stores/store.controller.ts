import { Controller, Get, Patch, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { StoreService } from './store.service';

@ApiTags('5. Store Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/stores')
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stores for the authenticated vendor' })
  getStores(@CurrentVendor() vendor: any) {
    return this.storeService.getStores(vendor.id);
  }

  @Get('primary')
  @ApiOperation({ summary: 'Get primary operational store with business hours' })
  getPrimaryStore(@CurrentVendor() vendor: any) {
    return this.storeService.getPrimaryStore(vendor.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update store branding, open/close status, prep time and radius' })
  updateStore(
    @CurrentVendor() vendor: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.storeService.updateStore(vendor.id, id, dto);
  }

  @Put(':id/hours')
  @ApiOperation({ summary: 'Update weekly 7-day operating schedule' })
  updateHours(
    @CurrentVendor() vendor: any,
    @Param('id') id: string,
    @Body('hours') hours: Array<any>,
  ) {
    return this.storeService.updateBusinessHours(vendor.id, id, hours);
  }
}
