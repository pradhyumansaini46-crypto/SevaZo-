import { Module } from '@nestjs/common';
import { VendorNotificationService } from './vendor-notification.service';
import { VendorNotificationController } from './vendor-notification.controller';
import { VendorAuthModule } from '../auth/vendor-auth.module';

@Module({
  imports: [VendorAuthModule],
  controllers: [VendorNotificationController],
  providers: [VendorNotificationService],
  exports: [VendorNotificationService],
})
export class VendorNotificationModule {}
