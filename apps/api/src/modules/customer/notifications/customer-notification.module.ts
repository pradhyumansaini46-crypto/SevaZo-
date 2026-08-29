import { Module } from '@nestjs/common';
import { CustomerNotificationController } from './customer-notification.controller';
import { CustomerNotificationService } from './customer-notification.service';

@Module({
  controllers: [CustomerNotificationController],
  providers: [CustomerNotificationService],
  exports: [CustomerNotificationService],
})
export class CustomerNotificationModule {}
