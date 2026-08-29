import { Module } from '@nestjs/common';
import { CustomerCheckoutController } from './customer-checkout.controller';
import { CustomerCheckoutService } from './customer-checkout.service';

@Module({
  controllers: [CustomerCheckoutController],
  providers: [CustomerCheckoutService],
  exports: [CustomerCheckoutService],
})
export class CustomerCheckoutModule {}
