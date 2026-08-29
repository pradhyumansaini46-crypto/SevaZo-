import { Module } from '@nestjs/common';
import { VendorPromotionService } from './vendor-promotion.service';
import { VendorPromotionController } from './vendor-promotion.controller';
import { VendorAuthModule } from '../auth/vendor-auth.module';

@Module({
  imports: [VendorAuthModule],
  controllers: [VendorPromotionController],
  providers: [VendorPromotionService],
  exports: [VendorPromotionService],
})
export class VendorPromotionModule {}
