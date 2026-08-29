import { Module } from '@nestjs/common';
import { RiderSettlementController } from './rider-settlement.controller';
import { RiderSettlementService } from './rider-settlement.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderSettlementController],
  providers: [RiderSettlementService],
  exports: [RiderSettlementService],
})
export class RiderSettlementModule {}
