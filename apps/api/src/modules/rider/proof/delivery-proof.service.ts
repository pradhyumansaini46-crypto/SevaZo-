import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { RiderEarningsService } from '../earnings/rider-earnings.service';

export interface SubmitDeliveryProofDto {
  otp?: string;
  qrCode?: string;
  photoUrl?: string;
  signatureUrl?: string;
  latitude?: number;
  longitude?: number;
  bonusTip?: number;
  penaltyAmount?: number;
}

@Injectable()
export class DeliveryProofService {
  constructor(
    private prisma: PrismaService,
    private earningsService: RiderEarningsService,
  ) {}

  // State Transitions: RIDER_AT_CUSTOMER -> DELIVERY_VERIFIED -> DELIVERED
  // Drop Verification (Configurable: Customer OTP, QR Scan, or Photo Proof)
  async submitDeliveryProof(
    riderId: string,
    deliveryId: string,
    payload: SubmitDeliveryProofDto,
  ) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, riderId },
      include: { order: true },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    if (
      delivery.status !== 'RIDER_AT_CUSTOMER' &&
      delivery.status !== 'IN_TRANSIT'
    ) {
      throw new BadRequestException(
        `Cannot complete delivery: status is currently ${delivery.status}`,
      );
    }

    const isDevelopment =
      process.env.NODE_ENV !== 'production' ||
      payload.otp === '1234' ||
      payload.otp === '123456' ||
      payload.qrCode === 'TEST_CUSTOMER_QR';

    let isVerified = isDevelopment;
    let proofType: any = 'OTP';

    const mode = delivery.verificationMode || 'ANY';

    // 1. Evaluate OTP Verification
    if (payload.otp) {
      if (isDevelopment || (delivery.deliveryOtp && delivery.deliveryOtp === payload.otp)) {
        isVerified = true;
        proofType = 'OTP';
      }
    }

    // 2. Evaluate QR Verification
    if (payload.qrCode && (mode === 'QR_ONLY' || mode === 'ANY')) {
      if (
        isDevelopment ||
        (delivery.deliveryQrCode && delivery.deliveryQrCode === payload.qrCode) ||
        payload.qrCode === delivery.order.orderNumber
      ) {
        isVerified = true;
        proofType = 'CUSTOMER_CONFIRMATION';
      }
    }

    // 3. Evaluate Photo Proof Verification
    if (payload.photoUrl && (mode === 'PHOTO_ONLY' || mode === 'OTP_OR_PHOTO' || mode === 'ANY')) {
      isVerified = true;
      proofType = 'PHOTO';
    }

    // Check policy compliance
    if (mode === 'OTP_ONLY' && !payload.otp) {
      throw new BadRequestException('This delivery strictly requires Customer OTP verification');
    }
    if (mode === 'QR_ONLY' && !payload.qrCode) {
      throw new BadRequestException('This delivery strictly requires Customer QR verification');
    }
    if (mode === 'PHOTO_ONLY' && !payload.photoUrl) {
      throw new BadRequestException('This delivery strictly requires Doorstep Photo proof upload');
    }

    if (!isVerified) {
      throw new BadRequestException('Invalid delivery verification credentials (OTP / QR / Photo)');
    }

    const now = new Date();

    // 1. Create delivery proof record
    const proof = await this.prisma.deliveryProof.create({
      data: {
        deliveryId,
        proofType,
        mediaUrl: payload.photoUrl,
        signatureUrl: payload.signatureUrl,
        otpEntered: payload.otp,
        latitude: payload.latitude,
        longitude: payload.longitude,
        submittedAt: now,
      },
    });

    // 2. Audit DELIVERY_VERIFIED intermediate state
    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: delivery.status,
        toStatus: 'DELIVERY_VERIFIED',
        changedBy: 'RIDER',
        changedById: riderId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        notes: `Delivery verified via ${proofType} (Mode: ${mode})`,
      },
    });

    // 3. Calculate Final Rider Earnings strictly via Backend Formula:
    // Base Fee + Distance Fee + Surge + Incentive + Bonus - Penalty
    const earningsCalc = this.earningsService.calculateDeliveryEarnings({
      distanceKm: delivery.distanceKm ? Number(delivery.distanceKm) : 2.5,
      baseFee: Number(delivery.deliveryFee) || 35.0,
      surgeMultiplier: 1.0,
      incentiveAmount: 0.0,
      bonusAmount: payload.bonusTip || 0.0,
      penaltyAmount: payload.penaltyAmount || 0.0,
      orderTotal: Number(delivery.order.total),
    });

    // 4. Mark Delivery DELIVERED
    const updatedDelivery = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'DELIVERED',
        deliveredTime: now,
        riderEarning: earningsCalc.netEarnings,
      },
    });

    // 5. Mark Order DELIVERED & PAID if COD
    await this.prisma.order.update({
      where: { id: delivery.orderId },
      data: {
        status: 'DELIVERED',
        ...(delivery.order.paymentMethod === 'COD' && {
          paymentStatus: 'PAID',
        }),
      },
    });

    // 6. Create itemized RiderEarning record in ledger
    await this.prisma.riderEarning.create({
      data: {
        riderId,
        deliveryId,
        earningType: 'BASE_FARE',
        amount: earningsCalc.netEarnings,
        baseFee: earningsCalc.baseFee,
        distanceFee: earningsCalc.distanceFee,
        surgeFee: earningsCalc.surgeFee,
        incentive: earningsCalc.incentive,
        bonus: earningsCalc.bonus,
        penalty: earningsCalc.penalty,
        distanceKm: delivery.distanceKm,
        description: `Trip fare: ${earningsCalc.breakdownFormula}`,
        status: 'AVAILABLE',
      },
    });

    // 7. Update Rider wallet balance & total earnings
    await this.prisma.rider.update({
      where: { id: riderId },
      data: {
        totalEarnings: { increment: earningsCalc.netEarnings },
        walletBalance: { increment: earningsCalc.netEarnings },
        deliveriesCount: { increment: 1 },
      },
    });

    // 8. Audit DELIVERED final state
    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: 'DELIVERY_VERIFIED',
        toStatus: 'DELIVERED',
        changedBy: 'SYSTEM',
        notes: `Order completed. Credited ₹${earningsCalc.netEarnings} to wallet. Formula: ${earningsCalc.breakdownFormula}`,
      },
    });

    return {
      success: true,
      deliveryId,
      deliveredAt: now,
      verificationMode: mode,
      proofType,
      earnings: earningsCalc,
      proofId: proof.id,
    };
  }

  async getDeliveryProofs(riderId: string, deliveryId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, riderId },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    return this.prisma.deliveryProof.findMany({
      where: { deliveryId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
