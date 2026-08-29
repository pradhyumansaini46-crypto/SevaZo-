import { Module } from '@nestjs/common';
import { RiderDeliveryController } from './rider-delivery.controller';
import { RiderDeliveryService } from './rider-delivery.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderDeliveryController],
  providers: [RiderDeliveryService],
  exports: [RiderDeliveryService],
})
export class DeliveryModule {}
