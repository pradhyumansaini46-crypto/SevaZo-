import { Module } from '@nestjs/common';
import { VendorProfileService } from './vendor-profile.service';
import { VendorProfileController } from './vendor-profile.controller';
import { VendorAuthModule } from '../auth/vendor-auth.module';

@Module({
  imports: [VendorAuthModule],
  controllers: [VendorProfileController],
  providers: [VendorProfileService],
  exports: [VendorProfileService],
})
export class VendorProfileModule {}
