import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary() {
    const [
      totalCustomers,
      totalVendors,
      activeVendors,
      totalRiders,
      onlineRiders,
      todayOrders,
      pendingOrders,
      pendingVendorApprovals,
      pendingRiderApprovals,
      pendingRefunds,
      pendingSettlements,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.vendor.count(),
      this.prisma.vendor.count({ where: { status: 'APPROVED' } }),
      this.prisma.rider.count(),
      this.prisma.rider.count({ where: { isOnline: true } }),
      this.prisma.order.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.vendor.count({ where: { status: 'UNDER_REVIEW' } }),
      this.prisma.rider.count({ where: { approvalStatus: 'PENDING' } }),
      this.prisma.refund.count({ where: { status: 'PENDING_APPROVAL' } }),
      this.prisma.settlement.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalCustomers,
      totalVendors,
      activeVendors,
      totalRiders,
      onlineRiders,
      todayOrders,
      todayRevenue: 284500,
      pendingOrders,
      pendingVendorApprovals,
      pendingRiderApprovals,
      pendingRefunds,
      pendingSettlements,
      customersGrowth: 14.8,
      ordersGrowth: 18.5,
      revenueGrowth: 16.2,
    };
  }

  async getRevenueTrend() {
    return [
      { date: 'Aug 14', revenue: 215000, target: 200000 },
      { date: 'Aug 15', revenue: 310000, target: 220000 },
      { date: 'Aug 16', revenue: 245000, target: 220000 },
      { date: 'Aug 17', revenue: 260000, target: 220000 },
      { date: 'Aug 18', revenue: 275000, target: 230000 },
      { date: 'Aug 19', revenue: 290000, target: 230000 },
      { date: 'Aug 20', revenue: 284500, target: 240000 },
    ];
  }

  async getOrdersTrend() {
    return [
      { date: 'Aug 14', orders: 280, delivered: 268, cancelled: 12 },
      { date: 'Aug 15', orders: 410, delivered: 395, cancelled: 15 },
      { date: 'Aug 16', orders: 315, delivered: 304, cancelled: 11 },
      { date: 'Aug 17', orders: 330, delivered: 322, cancelled: 8 },
      { date: 'Aug 18', orders: 350, delivered: 341, cancelled: 9 },
      { date: 'Aug 19', orders: 365, delivered: 355, cancelled: 10 },
      { date: 'Aug 20', orders: 342, delivered: 334, cancelled: 8 },
    ];
  }

  async getCancellationRate() {
    return [
      { date: 'Aug 14', rate: 4.2, benchmark: 3.0 },
      { date: 'Aug 15', rate: 3.6, benchmark: 3.0 },
      { date: 'Aug 16', rate: 3.4, benchmark: 3.0 },
      { date: 'Aug 17', rate: 2.4, benchmark: 3.0 },
      { date: 'Aug 18', rate: 2.5, benchmark: 3.0 },
      { date: 'Aug 19', rate: 2.7, benchmark: 3.0 },
      { date: 'Aug 20', rate: 2.3, benchmark: 3.0 },
    ];
  }

  async getDeliverySuccessRate() {
    return [
      { date: 'Aug 14', successRate: 95.8, benchmark: 95.0, onTime: 92.4 },
      { date: 'Aug 15', successRate: 96.4, benchmark: 95.0, onTime: 93.1 },
      { date: 'Aug 16', successRate: 96.6, benchmark: 95.0, onTime: 94.0 },
      { date: 'Aug 17', successRate: 97.6, benchmark: 95.0, onTime: 95.2 },
      { date: 'Aug 18', successRate: 97.5, benchmark: 95.0, onTime: 95.0 },
      { date: 'Aug 19', successRate: 97.3, benchmark: 95.0, onTime: 94.8 },
      { date: 'Aug 20', successRate: 97.7, benchmark: 95.0, onTime: 95.6 },
    ];
  }
}
