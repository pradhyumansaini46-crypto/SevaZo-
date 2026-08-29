import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerSearchService {
  constructor(private prisma: PrismaService) {}

  async searchProducts(q: string, categoryId?: string, minRating?: number, maxPrice?: number) {
    if (!q || q.trim().length === 0) return [];

    const where: any = {
      status: 'ACTIVE',
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
      ],
    };

    if (categoryId) where.categoryId = categoryId;
    if (minRating) where.rating = { gte: minRating };
    if (maxPrice) where.price = { lte: maxPrice };

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        variants: true,
      },
      take: 20,
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      categoryId: p.categoryId,
      categoryName: p.category?.name,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
      stock: p.stock,
      unit: p.unit,
      rating: Number(p.rating),
      reviewsCount: p.reviewsCount,
      images: p.images?.map((i) => i.url) || [],
      tags: p.tags,
      inStock: p.stock > 0,
      storeId: p.storeId,
    }));
  }

  async getSuggestions(prefix: string) {
    if (!prefix || prefix.length < 2) return [];

    const products = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        name: { contains: prefix, mode: 'insensitive' },
      },
      select: { name: true },
      take: 6,
    });

    return products.map((p) => p.name);
  }

  async getTrendingSearches() {
    return [
      'Amul Butter',
      'Fresh Paneer',
      'Organic Avocado',
      'Sourdough Bread',
      'Greek Yogurt',
      'Whole Milk 1L',
      'Farm Eggs',
      'Blueberries',
    ];
  }
}
