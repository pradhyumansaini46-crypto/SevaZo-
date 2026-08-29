import { Module } from '@nestjs/common';
import { CustomerReviewController } from './customer-review.controller';
import { CustomerReviewService } from './customer-review.service';

@Module({
  controllers: [CustomerReviewController],
  providers: [CustomerReviewService],
  exports: [CustomerReviewService],
})
export class CustomerReviewModule {}
