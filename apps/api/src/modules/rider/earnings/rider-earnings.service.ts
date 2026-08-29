import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

export interface EarningsCalculationParams {
  distanceKm?: number;
  baseFee?: number;
  surgeMultiplier?: number;
  incentiveAmount?: number;
  bonusAmount?: number;
  penaltyAmount?: number;
  orderTotal?: number;
}

export interface CalculatedEarningsResult {
  baseFee: number;
  distanceFee: number;
  surgeFee: number;
  incentive: number;
  bonus: number;
  penalty: number;
  netEarnings: number;
  breakdownFormula: string;
}

@Injectable()
export class RiderEarningsService {
  constructor(private prisma: PrismaService) {}

  // 1. Backend Centralized Rider Earnings Engine:
  // Base Delivery Fee + Distance Fee + Surge + Incentive + Bonus - Penalty = Rider Earnings
  calculateDeliveryEarnings(params: EarningsCalculationParams): CalculatedEarningsResult {
    const baseFee = params.baseFee ?? 35.0; // Default ₹35 base pay

    // Distance fee: ₹6.5 per km for distance beyond 2km base
    const distanceKm = params.distanceKm ? Number(params.distanceKm) : 2.0;
    const billableKm = Math.max(0, distanceKm - 2.0);
    const distanceFee = parseFloat((billableKm * 6.5).toFixed(2));

    // Surge fee: calculated on base + distance fee
    const multiplier = params.surgeMultiplier ?? 1.0;
    const subtotal = baseFee + distanceFee;
    const surgeFee = multiplier > 1.0 ? parseFloat(((multiplier - 1.0) * subtotal).toFixed(2)) : 0;

    // Incentive & Bonus
    const incentive = params.incentiveAmount ?? 0.0;
    const bonus = params.bonusAmount ?? 0.0;

    // Penalty deduction
    const penalty = params.penaltyAmount ?? 0.0;

    // Net Earnings calculation strictly on backend
    const rawNet = baseFee + distanceFee + surgeFee + incentive + bonus - penalty;
    const netEarnings = parseFloat(Math.max(0, rawNet).toFixed(2));

    const breakdownFormula = `₹${baseFee} (Base) + ₹${distanceFee} (Dist ${distanceKm}km) + ₹${surgeFee} (Surge ${multiplier}x) + ₹${incentive} (Incentive) + ₹${bonus} (Bonus) - ₹${penalty} (Penalty) = ₹${netEarnings}`;

    return {
      baseFee,
      distanceFee,
      surgeFee,
      incentive,
      bonus,
      penalty,
      netEarnings,
      breakdownFormula,
    };
  }

  // 2. Summary for rider app
  async getEarningsSummary(riderId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
      select: {
        totalEarnings: true,
        walletBalance: true,
        deliveriesCount: true,
      },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const todayEarnings = await this.prisma.riderEarning.aggregate({
      where: {
        riderId,
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const weeklyEarnings = await this.prisma.riderEarning.aggregate({
      where: {
        riderId,
        createdAt: { gte: weekStart },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    return {
      walletBalance: rider?.walletBalance || 0,
      totalLifetimeEarnings: rider?.totalEarnings || 0,
      totalDeliveries: rider?.deliveriesCount || 0,
      today: {
        amount: todayEarnings._sum.amount || 0,
        tripsCount: todayEarnings._count.id || 0,
      },
      thisWeek: {
        amount: weeklyEarnings._sum.amount || 0,
        tripsCount: weeklyEarnings._count.id || 0,
      },
    };
  }

  // 3. Itemized ledger
  async getEarningsLedger(riderId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, earnings] = await Promise.all([
      this.prisma.riderEarning.count({ where: { riderId } }),
      this.prisma.riderEarning.findMany({
        where: { riderId },
        skip,
        take: limit,
        include: {
          delivery: {
            select: {
              id: true,
              order: { select: { orderNumber: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: earnings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
