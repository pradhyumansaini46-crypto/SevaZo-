import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerCheckoutService {
  constructor(private prisma: PrismaService) {}

  async calculateBill(customerId: string, addressId?: string, couponCode?: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    const items = cart?.items || [];
    const itemTotal = items.reduce(
      (sum, i) => sum + Number(i.priceSnapshot) * i.quantity,
      0,
    );

    const deliveryFee = itemTotal > 199 || itemTotal === 0 ? 0 : 25;
    const handlingFee = 5;
    const tax = Math.round(itemTotal * 0.05);

    let discount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        if (!coupon.minOrderAmount || itemTotal >= Number(coupon.minOrderAmount)) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.min(
              Math.round((itemTotal * Number(coupon.discountValue)) / 100),
              coupon.maxDiscount ? Number(coupon.maxDiscount) : 9999,
            );
          } else {
            discount = Number(coupon.discountValue);
          }
          appliedCoupon = {
            id: coupon.id,
            code: coupon.code,
            discount,
            description: coupon.description,
          };
        }
      }
    }

    const grandTotal = Math.max(0, itemTotal + deliveryFee + handlingFee + tax - discount);

    return {
      itemTotal,
      deliveryFee,
      handlingFee,
      tax,
      discount,
      grandTotal,
      appliedCoupon,
      freeDeliveryThreshold: 199,
      amountNeededForFreeDelivery: Math.max(0, 199 - itemTotal),
    };
  }

  async getAvailableCoupons(itemTotal: number) {
    const coupons = await this.prisma.coupon.findMany({
      where: { isActive: true },
    });

    return coupons.map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : undefined,
      minOrderValue: c.minOrderAmount ? Number(c.minOrderAmount) : undefined,
      description: c.description || `Save with ${c.code}`,
      isApplicable: !c.minOrderAmount || itemTotal >= Number(c.minOrderAmount),
      savings:
        c.discountType === 'PERCENTAGE'
          ? Math.min(
              Math.round((itemTotal * Number(c.discountValue)) / 100),
              c.maxDiscount ? Number(c.maxDiscount) : 9999,
            )
          : Number(c.discountValue),
    }));
  }
}
