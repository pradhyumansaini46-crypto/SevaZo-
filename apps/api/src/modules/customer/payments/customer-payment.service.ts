import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerPaymentService {
  constructor(private prisma: PrismaService) {}

  async verifyPayment(orderId: string, paymentMethod: string, transactionId?: string) {
    // In production, integrate with Razorpay/PhonePe/Stripe gateway
    // For now, simulate payment verification
    try {
      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return { success: false, message: 'Order not found' };

      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' },
      });

      return {
        success: true,
        orderId,
        paymentMethod,
        transactionId: transactionId || `TXN-${Date.now()}`,
        amount: Number(order.total),
        status: 'PAID',
        verifiedAt: new Date().toISOString(),
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  async handleWebhook(event: string, payload: any) {
    // Process payment gateway callbacks (Razorpay/PhonePe webhooks)
    if (event === 'payment.captured') {
      const orderId = payload.orderId;
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' },
      });
      return { received: true };
    }

    if (event === 'payment.failed') {
      const orderId = payload.orderId;
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
      return { received: true };
    }

    return { received: true };
  }

  async getWallet(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    return {
      customerId,
      balance: 450, // In production, track via a wallet_transactions ledger table
      currency: 'INR',
      cashbackRate: 5,
      lastUpdated: customer?.updatedAt || new Date(),
    };
  }

  async addWalletFunds(customerId: string, amount: number) {
    // In production, process UPI/card payment, then credit wallet
    return {
      success: true,
      transactionId: `WTX-${Date.now()}`,
      amount,
      newBalance: 450 + amount,
      creditedAt: new Date().toISOString(),
    };
  }
}
