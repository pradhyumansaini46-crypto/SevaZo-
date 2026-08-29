import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerTrackingService {
  constructor(private prisma: PrismaService) {}

  private otpStore = new Map<string, string>();

  async getTracking(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        delivery: {
          include: { rider: true },
        },
        store: true,
        deliveryAddress: true,
      },
    });

    if (!order) return null;

    // Generate delivery OTP if not already generated
    if (!this.otpStore.has(orderId)) {
      this.otpStore.set(orderId, String(Math.floor(1000 + Math.random() * 9000)));
    }

    const rider = order.delivery?.rider;

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      remainingMinutes: order.status === 'IN_TRANSIT' ? 11 : order.status === 'PREPARING' ? 18 : 5,
      distanceRemainingKm: 1.4,
      deliveryOtp: this.otpStore.get(orderId),
      rider: rider
        ? {
            id: rider.id,
            name: rider.name,
            phone: rider.phone,
            avatar: rider.avatar,
            rating: Number(rider.rating),
            vehicleModel: 'Ather 450X',
            vehiclePlate: 'KA-03-EM-8899',
          }
        : {
            id: 'r-401',
            name: 'Santosh Rawat',
            phone: '+91 9123456780',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            rating: 4.9,
            vehicleModel: 'Ather 450X',
            vehiclePlate: 'KA-03-EM-8899',
          },
      store: {
        name: order.store?.name || 'Sevazo Dark Store',
        latitude: 12.9352,
        longitude: 77.6245,
      },
      destination: {
        latitude: order.deliveryAddress?.latitude || 12.9416,
        longitude: order.deliveryAddress?.longitude || 77.6269,
      },
      riderLocation: {
        latitude: 12.938,
        longitude: 77.626,
      },
      timeline: [
        { step: 'CONFIRMED', title: 'Order Confirmed', description: 'Payment verified & order placed', completed: true, current: false, timestamp: order.createdAt },
        { step: 'PREPARING', title: 'Packing at Store', description: 'Your items are being carefully packed', completed: ['PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(order.status), current: order.status === 'PREPARING', timestamp: null },
        { step: 'PICKED_UP', title: 'Rider Picked Up', description: 'Rider collected your order from dark store', completed: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(order.status), current: order.status === 'PICKED_UP', timestamp: null },
        { step: 'IN_TRANSIT', title: 'On The Way', description: 'Rider is heading to your location', completed: ['IN_TRANSIT', 'DELIVERED'].includes(order.status), current: order.status === 'IN_TRANSIT', timestamp: null },
        { step: 'DELIVERED', title: 'Delivered', description: 'Handed over with OTP verification', completed: order.status === 'DELIVERED', current: false, timestamp: null },
      ],
    };
  }

  async verifyDeliveryOtp(orderId: string, otp: string) {
    const storedOtp = this.otpStore.get(orderId);

    if (!storedOtp || storedOtp !== otp) {
      return { success: false, message: 'Invalid delivery OTP' };
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' },
    });

    this.otpStore.delete(orderId);

    return {
      success: true,
      message: 'Delivery verified! Order marked as delivered.',
      deliveredAt: new Date().toISOString(),
    };
  }
}
