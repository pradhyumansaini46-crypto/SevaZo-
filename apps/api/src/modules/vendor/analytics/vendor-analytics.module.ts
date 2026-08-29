import { Module } from '@nestjs/common';
import { VendorAnalyticsService } from './vendor-analytics.service';
import { VendorAnalyticsController } from './vendor-analytics.controller';
import { VendorAuthModule } from '../auth/vendor-auth.module';

@Module({
  imports: [VendorAuthModule],
  controllers: [VendorAnalyticsController],
  providers: [VendorAnalyticsService],
  exports: [VendorAnalyticsService],
})
export class VendorAnalyticsModule {}
