import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { DispatchService } from '../dispatch/dispatch.service';

@Injectable()
export class RiderAssignmentService {
  constructor(
    private prisma: PrismaService,
    private dispatchService: DispatchService,
  ) {}

  async getPendingOffers(riderId: string) {
    const now = new Date();
    return this.prisma.deliveryAssignment.findMany({
      where: {
        riderId,
        status: 'OFFERED',
        expireAt: { gt: now },
      },
      include: {
        delivery: {
          include: {
            order: {
              include: {
                vendor: { select: { businessName: true, ownerName: true, addresses: true } },
                deliveryAddress: true,
                items: { select: { id: true, name: true, quantity: true } },
              },
            },
          },
        },
      },
      orderBy: { offeredAt: 'desc' },
    });
  }

  async acceptOffer(riderId: string, assignmentId: string) {
    const assignment = await this.prisma.deliveryAssignment.findUnique({
      where: { id: assignmentId },
      include: { delivery: true },
    });

    if (!assignment || assignment.riderId !== riderId) {
      throw new NotFoundException('Delivery assignment offer not found');
    }

    if (assignment.status !== 'OFFERED') {
      throw new BadRequestException(`Assignment is already ${assignment.status.toLowerCase()}`);
    }

    if (assignment.expireAt < new Date()) {
      await this.prisma.deliveryAssignment.update({
        where: { id: assignmentId },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Delivery assignment offer has expired');
    }

    // Generate 4-digit pickup and delivery OTPs
    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // 1. Mark assignment ACCEPTED
    await this.prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    // 2. Cancel other pending offers for this delivery
    await this.prisma.deliveryAssignment.updateMany({
      where: {
        deliveryId: assignment.deliveryId,
        id: { not: assignmentId },
        status: 'OFFERED',
      },
      data: { status: 'CANCELLED' },
    });

    // 3. State Machine: ASSIGNMENT_OFFERED -> RIDER_ACCEPTED
    const updatedDelivery = await this.prisma.delivery.update({
      where: { id: assignment.deliveryId },
      data: {
        riderId,
        status: 'RIDER_ACCEPTED',
        pickupOtp,
        deliveryOtp,
        riderEarning: assignment.delivery.riderEarning || 45.0,
      },
      include: {
        order: {
          include: {
            vendor: { select: { businessName: true, ownerName: true, phone: true, addresses: true } },
            deliveryAddress: true,
            items: true,
          },
        },
      },
    });

    // 4. Audit status history
    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId: assignment.deliveryId,
        fromStatus: 'ASSIGNMENT_OFFERED',
        toStatus: 'RIDER_ACCEPTED',
        changedBy: 'RIDER',
        changedById: riderId,
        notes: 'Delivery assignment accepted by rider',
      },
    });

    return updatedDelivery;
  }

  async rejectOffer(riderId: string, assignmentId: string, reason?: string) {
    const assignment = await this.prisma.deliveryAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment || assignment.riderId !== riderId) {
      throw new NotFoundException('Delivery assignment offer not found');
    }

    await this.prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
        rejectionReason: reason || 'Declined by rider',
      },
    });

    // Trigger redispatch to next candidate
    this.dispatchService.dispatchDelivery(assignment.deliveryId).catch(() => null);

    return { success: true, message: 'Delivery offer rejected' };
  }
}
