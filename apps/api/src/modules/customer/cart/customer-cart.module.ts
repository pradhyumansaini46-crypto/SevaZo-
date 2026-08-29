import { Module } from '@nestjs/common';
import { CustomerCartController } from './customer-cart.controller';
import { CustomerCartService } from './customer-cart.service';

@Module({
  controllers: [CustomerCartController],
  providers: [CustomerCartService],
  exports: [CustomerCartService],
})
export class CustomerCartModule {}
