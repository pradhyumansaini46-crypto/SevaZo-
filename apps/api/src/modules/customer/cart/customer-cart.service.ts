import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerCartService {
  constructor(private prisma: PrismaService) {}

  async getCart(customerId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
            variant: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { customerId },
        include: {
          items: {
            include: {
              product: {
                include: { images: true },
              },
              variant: true,
            },
          },
        },
      });
    }

    const items = cart.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      variantId: i.variantId,
      productName: i.product.name,
      variantName: i.variant?.name,
      productImage: i.product.images[0]?.url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
      price: Number(i.priceSnapshot),
      quantity: i.quantity,
      total: Number(i.priceSnapshot) * i.quantity,
      unit: i.product.unit,
      inStock: i.product.stock >= i.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const deliveryFee = subtotal > 199 || subtotal === 0 ? 0 : 25;
    const tax = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + deliveryFee + tax;

    return {
      id: cart.id,
      customerId: cart.customerId,
      couponId: cart.couponId,
      items,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      totalCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addItem(customerId: string, productId: string, variantId?: string, quantity = 1) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) throw new BadRequestException('Product not found');

    let cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { customerId } });
    }

    const price = variantId
      ? product.variants.find((v) => v.id === variantId)?.price || product.price
      : product.price;

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
          priceSnapshot: price,
        },
      });
    }

    return this.getCart(customerId);
  }

  async updateItemQuantity(customerId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return this.getCart(customerId);
  }

  async removeItem(customerId: string, itemId: string) {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(customerId);
  }

  async clearCart(customerId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return this.getCart(customerId);
  }
}
