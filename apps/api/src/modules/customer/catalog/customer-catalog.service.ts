import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerCatalogService {
  constructor(private prisma: PrismaService) {}

  async getHome() {
    try {
      const categories = await this.prisma.category.findMany({
        take: 8,
        include: { _count: { select: { products: true } } },
      });

      const products = await this.prisma.product.findMany({
        where: { status: 'ACTIVE' },
        take: 10,
        include: {
          category: true,
          images: true,
          variants: true,
          vendor: true,
        },
      });

      const stores = await this.prisma.store.findMany({
        take: 5,
        include: {
          vendor: true,
        },
      });

      return {
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          imageUrl: c.image,
          itemCount: c._count.products,
        })),
        trendingProducts: products.map((p) => this.formatProduct(p)),
        flashDeals: products.filter((p) => p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price)),
        topStores: stores,
      };
    } catch {
      return {
        categories: [],
        trendingProducts: [],
        flashDeals: [],
        topStores: [],
      };
    }
  }

  async getCategories() {
    try {
      const categories = await this.prisma.category.findMany({
        include: {
          children: true,
          _count: { select: { products: true } },
        },
      });
      return categories;
    } catch {
      return [];
    }
  }

  async getProducts(query: any) {
    try {
      const where: any = { status: 'ACTIVE' };
      if (query.categoryId) where.categoryId = query.categoryId;
      if (query.storeId) where.storeId = query.storeId;
      if (query.query) {
        where.OR = [
          { name: { contains: query.query, mode: 'insensitive' } },
          { description: { contains: query.query, mode: 'insensitive' } },
        ];
      }

      const products = await this.prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          variants: true,
        },
      });

      return products.map((p) => this.formatProduct(p));
    } catch {
      return [];
    }
  }

  async getProductById(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: true,
          variants: true,
          brand: true,
          store: true,
        },
      });
      if (!product) return null;
      return this.formatProduct(product);
    } catch {
      return null;
    }
  }

  async getStores() {
    try {
      return this.prisma.store.findMany({
        include: {
          vendor: true,
          category: true,
        },
      });
    } catch {
      return [];
    }
  }

  async getStoreById(id: string) {
    try {
      return this.prisma.store.findUnique({
        where: { id },
        include: {
          vendor: true,
          category: true,
          products: {
            where: { status: 'ACTIVE' },
            include: { images: true, variants: true },
          },
        },
      });
    } catch {
      return null;
    }
  }

  private formatProduct(p: any) {
    return {
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
      images: p.images?.map((i: any) => i.url) || [],
      variants: p.variants?.map((v: any) => ({
        id: v.id,
        productId: v.productId,
        name: v.name,
        sku: v.sku,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        stock: v.stock,
      })),
      tags: p.tags,
      inStock: p.stock > 0,
      storeId: p.storeId,
    };
  }
}
