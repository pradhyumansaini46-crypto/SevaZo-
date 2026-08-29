import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { VendorAuthGuard } from '../common/vendor-auth.guard';
import { CurrentVendor } from '../common/vendor.decorator';
import { VendorNotificationService } from './vendor-notification.service';

@ApiTags('11. Vendor Notification Module')
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@Controller('vendor/notifications')
export class VendorNotificationController {
  constructor(private notifService: VendorNotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get merchant alert notification feed' })
  getNotifications(@CurrentVendor() vendor: any) {
    return this.notifService.getNotifications(vendor.id);
  }
}
