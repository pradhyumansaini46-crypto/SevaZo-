import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class RiderDropService {
  constructor(private prisma: PrismaService) {}

  // State Transition: IN_TRANSIT -> RIDER_AT_CUSTOMER
  async arriveAtCustomer(
    riderId: string,
    deliveryId: string,
    coords?: { latitude?: number; longitude?: number },
  ) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, riderId },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    if (delivery.status !== 'IN_TRANSIT') {
      throw new BadRequestException(
        `Cannot mark arrived at customer: current status is ${delivery.status}`,
      );
    }

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'RIDER_AT_CUSTOMER' },
    });

    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: 'IN_TRANSIT',
        toStatus: 'RIDER_AT_CUSTOMER',
        changedBy: 'RIDER',
        changedById: riderId,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        notes: 'Rider reached customer delivery doorstep',
      },
    });

    return updated;
  }

  async getCustomerContact(riderId: string, deliveryId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, riderId },
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            deliveryAddress: true,
          },
        },
      },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    return {
      customerName: delivery.order.customer.name,
      phone: delivery.order.customer.phone,
      address: delivery.order.deliveryAddress,
      instructions: delivery.order.notes,
    };
  }
}
