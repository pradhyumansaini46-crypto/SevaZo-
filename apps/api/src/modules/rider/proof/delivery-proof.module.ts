import { Module } from '@nestjs/common';
import { DeliveryProofController } from './delivery-proof.controller';
import { DeliveryProofService } from './delivery-proof.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';
import { RiderEarningsModule } from '../earnings/rider-earnings.module';

@Module({
  imports: [PrismaModule, RiderAuthModule, RiderEarningsModule],
  controllers: [DeliveryProofController],
  providers: [DeliveryProofService],
  exports: [DeliveryProofService],
})
export class DeliveryProofModule {}
