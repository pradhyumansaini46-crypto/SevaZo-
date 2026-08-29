import { Module } from '@nestjs/common';
import { VendorFinanceService } from './vendor-finance.service';
import { VendorFinanceController } from './vendor-finance.controller';
import { VendorAuthModule } from '../auth/vendor-auth.module';

@Module({
  imports: [VendorAuthModule],
  controllers: [VendorFinanceController],
  providers: [VendorFinanceService],
  exports: [VendorFinanceService],
})
export class VendorFinanceModule {}
