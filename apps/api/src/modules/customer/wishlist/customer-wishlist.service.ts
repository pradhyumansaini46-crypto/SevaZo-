import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerWishlistService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateWishlist(customerId: string) {
    let wishlist = await this.prisma.wishlist.findFirst({
      where: { customerId },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { customerId, name: 'My Wishlist' },
      });
    }

    return wishlist;
  }

  async getWishlist(customerId: string) {
    const wishlist = await this.getOrCreateWishlist(customerId);

    const items = await this.prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist.id },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      id: wishlist.id,
      name: wishlist.name,
      itemCount: items.length,
      items: items.map((i) => ({
        id: i.id,
        productId: i.product.id,
        name: i.product.name,
        price: Number(i.product.price),
        compareAtPrice: i.product.compareAtPrice ? Number(i.product.compareAtPrice) : undefined,
        image: i.product.images[0]?.url || '',
        categoryName: i.product.category?.name,
        inStock: i.product.stock > 0,
        addedAt: i.createdAt,
      })),
    };
  }

  async toggleItem(customerId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(customerId);

    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { action: 'REMOVED', productId, inWishlist: false };
    }

    await this.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return { action: 'ADDED', productId, inWishlist: true };
  }

  async removeItem(itemId: string) {
    await this.prisma.wishlistItem.delete({ where: { id: itemId } });
    return { success: true };
  }
}
