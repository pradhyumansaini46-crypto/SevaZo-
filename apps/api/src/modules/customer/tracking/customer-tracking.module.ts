import { Module } from '@nestjs/common';
import { CustomerTrackingController } from './customer-tracking.controller';
import { CustomerTrackingService } from './customer-tracking.service';

@Module({
  controllers: [CustomerTrackingController],
  providers: [CustomerTrackingService],
  exports: [CustomerTrackingService],
})
export class CustomerTrackingModule {}
