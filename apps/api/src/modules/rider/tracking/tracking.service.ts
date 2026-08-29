import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async getDeliveryTracking(deliveryId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            vehicleType: true,
            vehicleNumber: true,
            rating: true,
            currentLat: true,
            currentLng: true,
          },
        },
        order: {
          include: {
            vendor: {
              select: {
                businessName: true,
                ownerName: true,
                phone: true,
                addresses: true,
              },
            },
            deliveryAddress: true,
          },
        },
        locationHistory: {
          take: 30,
          orderBy: { recordedAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    const vendorAddress = delivery.order.vendor.addresses[0];
    const customerAddress = delivery.order.deliveryAddress;

    return {
      deliveryId: delivery.id,
      status: delivery.status,
      rider: delivery.rider,
      pickup: {
        vendorName: delivery.order.vendor.businessName || delivery.order.vendor.ownerName,
        phone: delivery.order.vendor.phone,
        address: vendorAddress,
      },
      drop: {
        customerName: delivery.order.deliveryAddress.label,
        address: customerAddress,
      },
      estimatedMinutes: delivery.estimatedTime ? 15 : 20,
      breadcrumbs: delivery.locationHistory.reverse(),
      timeline: delivery.statusHistory,
    };
  }
}
