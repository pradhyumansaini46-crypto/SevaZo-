import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CustomerReviewService } from './customer-review.service';

@ApiTags('Customer 10. Reviews Module')
@Controller('customer/reviews')
export class CustomerReviewController {
  constructor(private service: CustomerReviewService) {}

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all reviews for a product with rating distribution' })
  getProductReviews(@Param('productId') productId: string) {
    return this.service.getProductReviews(productId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a product review (1-5 stars, comment, images)' })
  createReview(@Req() req: any, @Body() body: any) {
    const customerId = req.user?.id || req.user?.sub || 'cust-101';
    return this.service.createReview(customerId, body);
  }
}
