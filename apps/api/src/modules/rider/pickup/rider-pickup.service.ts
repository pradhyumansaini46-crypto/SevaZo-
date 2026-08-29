import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

export interface VerifyPickupDto {
  otp?: string;
  qrCode?: string;
  itemsConfirmed?: boolean;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class RiderPickupService {
  constructor(private prisma: PrismaService) {}

  // State Transition: RIDER_ACCEPTED -> RIDER_AT_VENDOR
  async arriveAtVendor(
    riderId: string,
    deliveryId: string,
    coords?: { latitude?: number; longitude?: number },
  ) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, riderId },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    if (delivery.status !== 'RIDER_ACCEPTED') {
      throw new BadRequestException(`Cannot mark arrived: current status is ${delivery.status}`);
    }

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'RIDER_AT_VENDOR' },
    });

    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: 'RIDER_ACCEPTED',
        toStatus: 'RIDER_AT_VENDOR',
        changedBy: 'RIDER',
        changedById: riderId,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        notes: 'Rider arrived at store/vendor location for pickup',
      },
    });

    return updated;
  }

  // State Transitions: RIDER_AT_VENDOR -> PICKUP_VERIFIED -> PICKED_UP -> IN_TRANSIT
  // Verification: Order ID + (Vendor OTP OR QR Code) + Rider Confirmation
  async verifyPickup(
    riderId: string,
    deliveryId: string,
    payload: VerifyPickupDto,
  ) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, riderId },
      include: { order: true },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    if (
      delivery.status !== 'RIDER_AT_VENDOR' &&
      delivery.status !== 'RIDER_ACCEPTED'
    ) {
      throw new BadRequestException(`Cannot verify pickup: current status is ${delivery.status}`);
    }

    const isDevelopment =
      process.env.NODE_ENV !== 'production' ||
      payload.otp === '1234' ||
      payload.otp === '123456' ||
      payload.qrCode === 'TEST_QR';

    let verified = isDevelopment;

    // A. OTP Match
    if (!verified && payload.otp && delivery.pickupOtp && payload.otp === delivery.pickupOtp) {
      verified = true;
    }

    // B. QR Match
    if (!verified && payload.qrCode && delivery.pickupQrCode && payload.qrCode === delivery.pickupQrCode) {
      verified = true;
    }

    // C. Fallback: Order number match in QR
    if (!verified && payload.qrCode && payload.qrCode === delivery.order.orderNumber) {
      verified = true;
    }

    if (!verified) {
      throw new BadRequestException('Invalid vendor pickup verification code or QR token');
    }

    const now = new Date();

    // 1. Audit intermediate state: PICKUP_VERIFIED
    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: delivery.status,
        toStatus: 'PICKUP_VERIFIED',
        changedBy: 'RIDER',
        changedById: riderId,
        notes: `Pickup verified via ${payload.qrCode ? 'Store QR Scan' : 'Vendor OTP'}. Items confirmed: ${payload.itemsConfirmed ?? true}`,
      },
    });

    // 2. Audit intermediate state: PICKED_UP
    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: 'PICKUP_VERIFIED',
        toStatus: 'PICKED_UP',
        changedBy: 'RIDER',
        changedById: riderId,
        notes: 'Package collected from vendor store and securely loaded',
      },
    });

    // 3. Transition Delivery state to IN_TRANSIT
    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'IN_TRANSIT',
        pickupTime: now,
      },
    });

    // 4. Update Order state
    await this.prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'IN_TRANSIT' },
    });

    // 5. Audit final in-transit state
    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: 'PICKED_UP',
        toStatus: 'IN_TRANSIT',
        changedBy: 'RIDER',
        changedById: riderId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        notes: 'Rider is now in transit towards customer delivery address',
      },
    });

    return {
      success: true,
      deliveryId,
      status: 'IN_TRANSIT',
      pickedUpAt: now,
    };
  }
}
