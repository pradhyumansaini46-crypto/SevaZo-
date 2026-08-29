import { Module } from '@nestjs/common';
import { RiderBankingController } from './rider-banking.controller';
import { RiderBankingService } from './rider-banking.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderBankingController],
  providers: [RiderBankingService],
  exports: [RiderBankingService],
})
export class RiderBankingModule {}
