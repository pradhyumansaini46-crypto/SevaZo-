import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerReviewService {
  constructor(private prisma: PrismaService) {}

  async getProductReviews(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: {
        customer: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      stars: star,
      count: reviews.filter((r) => r.rating === star).length,
      percentage:
        totalReviews > 0
          ? Math.round(
              (reviews.filter((r) => r.rating === star).length / totalReviews) * 100,
            )
          : 0,
    }));

    return {
      productId,
      averageRating: Number(avgRating.toFixed(1)),
      totalReviews,
      distribution,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        images: r.images,
        verifiedPurchase: r.verifiedPurchase,
        likesCount: r.likesCount,
        createdAt: r.createdAt,
        customer: {
          id: r.customer.id,
          name: r.customer.name,
          avatar: r.customer.avatar,
        },
      })),
    };
  }

  async createReview(customerId: string, data: any) {
    if (!data.productId) throw new BadRequestException('Product ID is required');
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be 1-5');
    }

    const review = await this.prisma.review.create({
      data: {
        customerId,
        productId: data.productId,
        orderId: data.orderId || null,
        storeId: data.storeId || null,
        rating: data.rating,
        comment: data.comment || null,
        images: data.images || [],
        verifiedPurchase: !!data.orderId,
      },
    });

    // Update product average rating & review count
    const productReviews = await this.prisma.review.findMany({
      where: { productId: data.productId },
      select: { rating: true },
    });

    const newAvg =
      productReviews.reduce((sum, r) => sum + r.rating, 0) /
      productReviews.length;

    await this.prisma.product.update({
      where: { id: data.productId },
      data: {
        rating: Number(newAvg.toFixed(2)),
        reviewsCount: productReviews.length,
      },
    });

    return {
      id: review.id,
      message: 'Review submitted successfully! Thank you for your feedback.',
    };
  }
}
