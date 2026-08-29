import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class VendorAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(vendorId: string) {
    return {
      salesTrend: [
        { date: 'Mon', sales: 12400 },
        { date: 'Tue', sales: 15800 },
        { date: 'Wed', sales: 14200 },
        { date: 'Thu', sales: 18900 },
        { date: 'Fri', sales: 24500 },
        { date: 'Sat', sales: 31200 },
        { date: 'Sun', sales: 28400 },
      ],
      topProducts: [
        { name: 'Organic Ratnagiri Alphonso Mangoes', quantity: 94, revenue: 32806 },
        { name: 'Farm Fresh Organic Whole Milk', quantity: 142, revenue: 11076 },
        { name: 'Cold Pressed Extra Virgin Olive Oil', quantity: 18, revenue: 16020 },
        { name: 'Artisanal Sourdough Country Loaf', quantity: 38, revenue: 6840 },
      ],
      fulfillmentRate: 98.4,
      cancellationRate: 1.6,
      averagePrepTimeMinutes: 12,
    };
  }
}
