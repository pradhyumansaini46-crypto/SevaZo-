import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma.module';
import { RiderOnboardingService } from './rider-onboarding.service';
import { RiderOnboardingController } from './rider-onboarding.controller';
import { RiderAuthModule } from '../auth/rider-auth.module';

@Module({
  imports: [PrismaModule, RiderAuthModule],
  providers: [RiderOnboardingService],
  controllers: [RiderOnboardingController],
  exports: [RiderOnboardingService],
})
export class RiderOnboardingModule {}
