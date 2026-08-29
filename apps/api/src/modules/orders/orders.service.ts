import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto & { status?: any; paymentStatus?: any; vendorId?: string; customerId?: string }) {
    const { page = 1, limit = 10, search, status, paymentStatus, vendorId, customerId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (vendorId) where.vendorId = vendorId;
    if (customerId) where.customerId = customerId;

    const [total, data] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          vendor: { select: { id: true, businessName: true, ownerName: true } },
          delivery: { include: { rider: { select: { id: true, name: true, phone: true } } } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        vendor: true,
        deliveryAddress: true,
        items: { include: { product: true } },
        delivery: { include: { rider: true, zone: true } },
        payment: true,
        refunds: true,
        commission: true,
        disputes: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: any, notes?: string, cancelledBy?: string) {
    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        notes: notes ? notes : undefined,
        cancelledBy: cancelledBy ? cancelledBy : undefined,
      },
    });
  }
}
