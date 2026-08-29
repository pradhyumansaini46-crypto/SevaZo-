import { Module } from '@nestjs/common';
import { VendorOrderService } from './vendor-order.service';
import { VendorOrderController } from './vendor-order.controller';
import { VendorAuthModule } from '../auth/vendor-auth.module';

@Module({
  imports: [VendorAuthModule],
  controllers: [VendorOrderController],
  providers: [VendorOrderService],
  exports: [VendorOrderService],
})
export class VendorOrderModule {}
