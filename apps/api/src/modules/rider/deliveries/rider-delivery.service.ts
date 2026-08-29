import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class RiderDeliveryService {
  constructor(private prisma: PrismaService) {}

  // 1. Get active in-flight trip
  async getActiveDelivery(riderId: string) {
    const active = await this.prisma.delivery.findFirst({
      where: {
        riderId,
        status: {
          in: [
            'ASSIGNMENT_OFFERED',
            'RIDER_ACCEPTED',
            'RIDER_AT_VENDOR',
            'PICKUP_VERIFIED',
            'PICKED_UP',
            'IN_TRANSIT',
            'RIDER_AT_CUSTOMER',
            'DELIVERY_VERIFIED',
            'RETURN_REQUIRED',
          ],
        },
      },
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            vendor: {
              select: {
                id: true,
                ownerName: true,
                businessName: true,
                phone: true,
                addresses: true,
              },
            },
            store: true,
            deliveryAddress: true,
            items: {
              include: {
                product: {
                  select: { id: true, name: true, unit: true, images: true },
                },
              },
            },
          },
        },
        proofs: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return active;
  }

  // 2. Get delivery details by ID
  async getDeliveryDetails(riderId: string, deliveryId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, riderId },
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            vendor: {
              select: {
                id: true,
                ownerName: true,
                businessName: true,
                phone: true,
                addresses: true,
              },
            },
            store: true,
            deliveryAddress: true,
            items: {
              include: {
                product: { select: { id: true, name: true, unit: true, images: true } },
              },
            },
          },
        },
        proofs: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!delivery) throw new NotFoundException('Delivery not found or not assigned to you');
    return delivery;
  }

  // 3. Get completed/past history
  async getDeliveryHistory(riderId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, deliveries] = await Promise.all([
      this.prisma.delivery.count({
        where: {
          riderId,
          status: { in: ['DELIVERED', 'FAILED', 'CANCELLED', 'RETURNED'] },
        },
      }),
      this.prisma.delivery.findMany({
        where: {
          riderId,
          status: { in: ['DELIVERED', 'FAILED', 'CANCELLED', 'RETURNED'] },
        },
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              deliveryAddress: true,
              vendor: { select: { businessName: true, ownerName: true } },
            },
          },
          earnings: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: deliveries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 4. Exception Transition: RETURN_REQUIRED
  async markReturnRequired(riderId: string, deliveryId: string, reason: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, riderId },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'RETURN_REQUIRED' },
    });

    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: delivery.status,
        toStatus: 'RETURN_REQUIRED',
        changedBy: 'RIDER',
        changedById: riderId,
        notes: `Delivery return initiated: ${reason}`,
      },
    });

    return updated;
  }

  // 5. Exception Transition: RETURNED
  async markReturned(riderId: string, deliveryId: string, notes?: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, riderId },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    if (delivery.status !== 'RETURN_REQUIRED') {
      throw new BadRequestException(`Cannot mark returned: status is ${delivery.status}`);
    }

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'RETURNED' },
    });

    await this.prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'RETURNED' },
    });

    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: 'RETURN_REQUIRED',
        toStatus: 'RETURNED',
        changedBy: 'RIDER',
        changedById: riderId,
        notes: notes || 'Package returned back to vendor store successfully',
      },
    });

    return updated;
  }

  // 6. Exception Transition: FAILED
  async markFailed(riderId: string, deliveryId: string, reason: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, riderId },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'FAILED' },
    });

    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: delivery.status,
        toStatus: 'FAILED',
        changedBy: 'RIDER',
        changedById: riderId,
        notes: `Delivery failed: ${reason}`,
      },
    });

    return updated;
  }
}
