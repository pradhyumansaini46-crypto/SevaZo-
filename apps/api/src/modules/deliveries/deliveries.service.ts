import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.delivery.count(),
      this.prisma.delivery.findMany({
        skip,
        take: limit,
        include: {
          order: { select: { id: true, orderNumber: true, total: true, deliveryAddress: true } },
          rider: { select: { id: true, name: true, phone: true, vehicleType: true } },
          zone: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async assignRider(deliveryId: string, riderId: string) {
    return this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        riderId,
        status: 'RIDER_ACCEPTED',
      },
    });
  }

  async getZones() {
    return this.prisma.deliveryZone.findMany({
      include: { _count: { select: { riders: true, deliveries: true } } },
    });
  }

  async createZone(data: { name: string; city: string; coordinates: any; baseFee?: number }) {
    return this.prisma.deliveryZone.create({
      data: {
        name: data.name,
        city: data.city,
        coordinates: data.coordinates,
        baseFee: data.baseFee || 30,
      },
    });
  }
}
