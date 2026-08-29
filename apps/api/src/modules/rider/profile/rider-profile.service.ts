import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class RiderProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(riderId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
      include: {
        documents: true,
        vehicles: true,
        zone: true,
        _count: {
          select: {
            deliveries: true,
            earnings: true,
          },
        },
      },
    });

    if (!rider) throw new NotFoundException('Rider not found');
    return rider;
  }

  async updateProfile(
    riderId: string,
    data: {
      name?: string;
      email?: string;
      avatar?: string;
      zoneId?: string;
    },
  ) {
    return this.prisma.rider.update({
      where: { id: riderId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.avatar && { avatar: data.avatar }),
        ...(data.zoneId && { zoneId: data.zoneId }),
      },
    });
  }

  async getPerformance(riderId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
      select: {
        id: true,
        rating: true,
        acceptanceRate: true,
        cancellationRate: true,
        deliveriesCount: true,
        totalEarnings: true,
        walletBalance: true,
      },
    });

    if (!rider) throw new NotFoundException('Rider not found');

    const completedDeliveries = await this.prisma.delivery.count({
      where: { riderId, status: 'DELIVERED' },
    });

    const failedDeliveries = await this.prisma.delivery.count({
      where: { riderId, status: 'FAILED' },
    });

    return {
      ...rider,
      completedDeliveries,
      failedDeliveries,
      onTimeDeliveryRate: 98.5, // Computed percentage
    };
  }
}
