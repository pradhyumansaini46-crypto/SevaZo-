import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.refund.count(),
      this.prisma.refund.findMany({
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              customer: { select: { name: true, phone: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createRefund(data: { orderId: string; amount: number; reason: string; notes?: string }) {
    return this.prisma.refund.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        reason: data.reason,
        status: 'PENDING_APPROVAL',
        notes: data.notes,
      },
    });
  }

  async processRefund(id: string, status: any, adminId: string, notes?: string) {
    return this.prisma.refund.update({
      where: { id },
      data: {
        status,
        processedBy: adminId,
        processedAt: new Date(),
        gatewayRef: `REF-GW-${Date.now()}`,
        notes,
      },
    });
  }
}
