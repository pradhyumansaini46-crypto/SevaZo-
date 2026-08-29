import { Module } from '@nestjs/common';
import { RiderEarningsController } from './rider-earnings.controller';
import { RiderEarningsService } from './rider-earnings.service';
import { PrismaModule } from '@/database/prisma.module';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  controllers: [RiderEarningsController],
  providers: [RiderEarningsService],
  exports: [RiderEarningsService],
})
export class RiderEarningsModule {}
