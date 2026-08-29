import { Module } from '@nestjs/common';
import { CustomerWishlistController } from './customer-wishlist.controller';
import { CustomerWishlistService } from './customer-wishlist.service';

@Module({
  controllers: [CustomerWishlistController],
  providers: [CustomerWishlistService],
  exports: [CustomerWishlistService],
})
export class CustomerWishlistModule {}
