import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { VendorProfileService } from './vendor-profile.service';

@ApiTags('2. Vendor Profile Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/profile')
export class VendorProfileController {
  constructor(private profileService: VendorProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get full vendor merchant profile with stores and bank info' })
  getProfile(@CurrentVendor() vendor: any) {
    return this.profileService.getProfile(vendor.id);
  }

  @Patch('personal')
  @ApiOperation({ summary: 'Update personal owner contact details' })
  updatePersonal(@CurrentVendor() vendor: any, @Body() dto: any) {
    return this.profileService.updatePersonalProfile(vendor.id, dto);
  }

  @Patch('business')
  @ApiOperation({ summary: 'Update legal business entity name & type' })
  updateBusiness(@CurrentVendor() vendor: any, @Body() dto: any) {
    return this.profileService.updateBusinessProfile(vendor.id, dto);
  }
}
