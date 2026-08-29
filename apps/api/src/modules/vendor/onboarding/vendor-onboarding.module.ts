import { Module } from '@nestjs/common';
import { VendorOnboardingService } from './vendor-onboarding.service';
import { VendorOnboardingController } from './vendor-onboarding.controller';
import { VendorAuthModule } from '../auth/vendor-auth.module';

@Module({
  imports: [VendorAuthModule],
  controllers: [VendorOnboardingController],
  providers: [VendorOnboardingService],
  exports: [VendorOnboardingService],
})
export class VendorOnboardingModule {}
