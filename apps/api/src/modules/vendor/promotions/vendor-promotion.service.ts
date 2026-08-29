import { Injectable } from '@nestjs/common';

@Injectable()
export class VendorPromotionService {
  private customCoupons: any[] = [];

  async getPromotions(vendorId: string) {
    const baseCoupons = [
      {
        id: 'c-1',
        code: 'FRESH20',
        description: '20% off on all organic fruits & veggies',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 299,
        maxDiscount: 100,
        validFrom: '2026-08-01',
        validUntil: '2026-08-31',
        isActive: true,
      },
      {
        id: 'c-2',
        code: 'MANGO50',
        description: 'Flat ₹50 off on Mango special packs',
        discountType: 'FLAT_AMOUNT',
        discountValue: 50,
        minOrderAmount: 499,
        validFrom: '2026-08-01',
        validUntil: '2026-08-31',
        isActive: true,
      },
    ];

    const banners = [
      {
        id: 'b-1',
        title: 'Summer Mango Festival 🥭',
        subtitle: 'Direct from Ratnagiri orchards',
        bannerUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
        isActive: true,
      },
    ];

    return {
      coupons: [...this.customCoupons, ...baseCoupons],
      banners,
    };
  }

  async createCoupon(vendorId: string, dto: any) {
    const newCoupon = {
      id: `c-${Date.now()}`,
      vendorId,
      code: dto.code.toUpperCase(),
      description: dto.description || '',
      discountType: dto.discountType || 'PERCENTAGE',
      discountValue: parseFloat(dto.discountValue),
      minOrderAmount: parseFloat(dto.minOrderAmount) || 0,
      maxDiscount: dto.maxDiscount ? parseFloat(dto.maxDiscount) : null,
      validFrom: dto.validFrom || new Date().toISOString(),
      validUntil: dto.validUntil || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      isActive: true,
    };

    this.customCoupons.unshift(newCoupon);
    return { success: true, coupon: newCoupon };
  }
}
