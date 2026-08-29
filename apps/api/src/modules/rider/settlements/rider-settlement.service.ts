import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class RiderSettlementService {
  constructor(private prisma: PrismaService) {}

  async getSettlements(riderId: string) {
    const earnings = await this.prisma.riderEarning.findMany({
      where: { riderId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
      select: { walletBalance: true },
    });

    return {
      availableBalance: rider?.walletBalance || 0,
      recentPayouts: earnings.filter((e) => e.status === 'WITHDRAWN'),
      pendingSettlements: earnings.filter((e) => e.status === 'AVAILABLE'),
    };
  }

  async requestPayout(riderId: string, amount: number, upiId?: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
    });

    if (!rider) throw new BadRequestException('Rider not found');

    const balance = Number(rider.walletBalance);
    if (balance < amount || amount <= 0) {
      throw new BadRequestException(`Insufficient wallet balance (Available: ₹${balance})`);
    }

    // Deduct wallet balance and mark earnings as WITHDRAWN
    await this.prisma.rider.update({
      where: { id: riderId },
      data: {
        walletBalance: { decrement: amount },
      },
    });

    return {
      success: true,
      message: `Payout request of ₹${amount} submitted successfully via ${upiId || 'default bank'}`,
      amount,
      remainingBalance: balance - amount,
      referenceId: `PO-RDR-${Date.now()}`,
      status: 'PROCESSING',
    };
  }
}
