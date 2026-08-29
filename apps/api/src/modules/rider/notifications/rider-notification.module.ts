import { Module } from '@nestjs/common';
import { RiderNotificationController } from './rider-notification.controller';
import { RiderNotificationService } from './rider-notification.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderNotificationController],
  providers: [RiderNotificationService],
  exports: [RiderNotificationService],
})
export class RiderNotificationModule {}
