import { Module } from '@nestjs/common';
import { RiderKycController } from './rider-kyc.controller';
import { RiderKycService } from './rider-kyc.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderKycController],
  providers: [RiderKycService],
  exports: [RiderKycService],
})
export class RiderKycModule {}
