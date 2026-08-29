import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class VendorOrderService {
  constructor(private prisma: PrismaService) {}

  async listOrders(
    vendorId: string,
    tab: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'HISTORY',
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    let statusFilter: any;
    switch (tab) {
      case 'NEW':
        statusFilter = { in: ['PENDING'] };
        break;
      case 'ACCEPTED':
        statusFilter = { in: ['CONFIRMED'] };
        break;
      case 'PREPARING':
        statusFilter = { in: ['PREPARING'] };
        break;
      case 'READY':
        statusFilter = { in: ['READY_FOR_PICKUP'] };
        break;
      case 'HISTORY':
        statusFilter = { in: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED'] };
        break;
      default:
        statusFilter = undefined;
    }

    const where: any = {
      vendorId, // Enforce strict tenant isolation on the central orders table
      ...(statusFilter && { status: statusFilter }),
    };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          deliveryAddress: true,
          delivery: {
            include: {
              rider: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  vehicleNumber: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderDetails(vendorId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, vendorId }, // Authorized view
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        customer: true,
        deliveryAddress: true,
        delivery: {
          include: {
            rider: true,
          },
        },
        payment: true,
        commission: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found or access unauthorized');
    return order;
  }

  async acceptOrder(vendorId: string, orderId: string) {
    const order = await this.getOrderDetails(vendorId, orderId);
    if (order.status !== 'PENDING') {
      throw new BadRequestException(`Cannot accept order in status: ${order.status}`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });
  }

  async rejectOrder(vendorId: string, orderId: string, reason: string) {
    const order = await this.getOrderDetails(vendorId, orderId);
    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      throw new BadRequestException('Order cannot be rejected at this stage');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledBy: 'VENDOR',
        cancellationReason: reason,
      },
    });
  }

  async markPreparing(vendorId: string, orderId: string) {
    const order = await this.getOrderDetails(vendorId, orderId);
    if (order.status !== 'CONFIRMED') {
      throw new BadRequestException('Order must be confirmed before marking preparing');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PREPARING' },
    });
  }

  async markReady(vendorId: string, orderId: string) {
    const order = await this.getOrderDetails(vendorId, orderId);
    if (order.status !== 'PREPARING' && order.status !== 'CONFIRMED') {
      throw new BadRequestException('Order must be preparing before marking ready for pickup');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'READY_FOR_PICKUP' },
    });
  }

  async getLiveStats(vendorId: string) {
    const [newOrders, acceptedOrders, preparingOrders, readyOrders, todaySalesAgg] =
      await Promise.all([
        this.prisma.order.count({ where: { vendorId, status: 'PENDING' } }),
        this.prisma.order.count({ where: { vendorId, status: 'CONFIRMED' } }),
        this.prisma.order.count({ where: { vendorId, status: 'PREPARING' } }),
        this.prisma.order.count({ where: { vendorId, status: 'READY_FOR_PICKUP' } }),
        this.prisma.order.aggregate({
          where: {
            vendorId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
            status: { notIn: ['CANCELLED'] },
          },
          _sum: { total: true },
          _count: { id: true },
        }),
      ]);

    return {
      newOrders,
      acceptedOrders,
      preparingOrders,
      readyOrders,
      activePipeline: newOrders + acceptedOrders + preparingOrders + readyOrders,
      todaySales: todaySalesAgg._sum.total ? Number(todaySalesAgg._sum.total) : 0,
      todayOrderCount: todaySalesAgg._count.id || 0,
    };
  }
}
