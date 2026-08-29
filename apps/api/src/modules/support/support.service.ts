import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async findAllTickets(query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.findMany({
        skip,
        take: limit,
        include: {
          customer: { select: { name: true, email: true, phone: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllDisputes(query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.dispute.count(),
      this.prisma.dispute.findMany({
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              customer: { select: { name: true } },
              vendor: { select: { businessName: true, ownerName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async replyTicket(ticketId: string, message: string, adminId: string) {
    return this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderType: 'ADMIN',
        senderId: adminId,
        message,
      },
    });
  }
}
