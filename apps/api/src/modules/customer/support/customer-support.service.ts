import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerSupportService {
  constructor(private prisma: PrismaService) {}

  async getTickets(customerId: string) {
    const tickets = await this.prisma.supportTicket.findMany({
      where: { customerId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      lastMessage: t.messages[0]?.message || t.subject,
      createdAt: t.createdAt,
    }));
  }

  async createTicket(customerId: string, subject: string, description: string) {
    const ticketCount = await this.prisma.supportTicket.count();
    const ticketNumber = `TKT-${String(ticketCount + 1001).padStart(6, '0')}`;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        customerId,
        subject,
        status: 'OPEN',
        priority: 'MEDIUM',
        messages: {
          create: {
            senderType: 'CUSTOMER',
            senderId: customerId,
            message: description,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      status: ticket.status,
      message: 'Ticket raised successfully. Our support team will respond within 15 minutes.',
      createdAt: ticket.createdAt,
    };
  }

  async addMessage(ticketId: string, message: string, senderId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return null;

    return this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderType: 'CUSTOMER',
        senderId,
        message,
      },
    });
  }

  async getFaqs() {
    return [
      {
        id: 'faq-1',
        question: 'How fast is Sevazo delivery?',
        answer: 'We deliver in 10-15 minutes using local micro-fulfillment dark stores and certified electric riders.',
        category: 'DELIVERY',
      },
      {
        id: 'faq-2',
        question: 'What if an item is damaged or not fresh?',
        answer: 'We offer an instant 100% refund policy. Just select "Request Return" on your delivered order, and refund is credited to your wallet immediately.',
        category: 'RETURNS',
      },
      {
        id: 'faq-3',
        question: 'How do I apply coupon codes?',
        answer: 'In the cart or checkout page, tap "Apply Coupon", choose from available active vouchers or enter your custom promo code.',
        category: 'PAYMENTS',
      },
      {
        id: 'faq-4',
        question: 'Can I change my delivery address after placing an order?',
        answer: 'Because orders are packed and dispatched in under 3 minutes, address changes are not possible once in transit. You can call your rider from the Live Tracking screen.',
        category: 'ORDERS',
      },
      {
        id: 'faq-5',
        question: 'What payment methods do you accept?',
        answer: 'We accept UPI (GPay, PhonePe, Paytm, CRED), Debit/Credit Cards (Visa, MasterCard, RuPay), Sevazo Wallet, and Cash on Delivery.',
        category: 'PAYMENTS',
      },
      {
        id: 'faq-6',
        question: 'How does the Sevazo Wallet work?',
        answer: 'Add money to your wallet for instant 1-second checkout. All refunds are credited to wallet instantly. Earn 5% extra cashback on every wallet payment.',
        category: 'PAYMENTS',
      },
    ];
  }
}
