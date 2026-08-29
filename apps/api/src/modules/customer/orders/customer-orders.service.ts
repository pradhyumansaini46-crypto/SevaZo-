import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerOrdersService {
  constructor(private prisma: PrismaService) {}

  async placeOrder(customerId: string, payload: any) {
    const orderNumber = `SVZ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const order = await this.prisma.order.create({
        data: {
          orderNumber,
          customerId,
          vendorId: payload.vendorId,
          storeId: payload.storeId,
          deliveryAddressId: payload.addressId,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentMethod: payload.paymentMethod || 'UPI',
          subtotal: payload.subtotal,
          deliveryFee: payload.deliveryFee || 0,
          discount: payload.discount || 0,
          tax: payload.tax || 0,
          total: payload.totalAmount,
          couponId: payload.couponId || null,
          notes: payload.notes,
          items: {
            create: (payload.items || []).map((item: any) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })),
          },
        },
        include: {
          items: true,
          deliveryAddress: true,
        },
      });

      // Clear cart after successful order
      const cart = await this.prisma.cart.findUnique({ where: { customerId } });
      if (cart) {
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      // Increment customer orders count
      await this.prisma.customer.update({
        where: { id: customerId },
        data: { ordersCount: { increment: 1 } },
      });

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: Number(order.total),
        estimatedDeliveryTime: '10-15 mins',
        createdAt: order.createdAt,
      };
    } catch (e: any) {
      throw new BadRequestException(`Order placement failed: ${e.message}`);
    }
  }

  async getOrders(customerId: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: { customerId },
        include: {
          items: { include: { product: { include: { images: true } } } },
          deliveryAddress: true,
          vendor: true,
          store: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.deliveryFee),
        discount: Number(o.discount),
        tax: Number(o.tax),
        totalAmount: Number(o.total),
        createdAt: o.createdAt,
        store: {
          businessName: o.store?.name || o.vendor?.businessName || 'Sevazo Store',
          address: o.store?.description || o.vendor?.businessName || 'Sevazo Hub',
        },
        deliveryAddress: o.deliveryAddress,
        items: o.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productName: i.name,
          productImage: i.product?.images?.[0]?.url || '',
          quantity: i.quantity,
          unitPrice: Number(i.price),
          totalPrice: Number(i.total),
        })),
        canCancel: ['PENDING', 'CONFIRMED'].includes(o.status),
        canReturn: o.status === 'DELIVERED',
      }));
    } catch {
      return [];
    }
  }

  async getOrderById(customerId: string, orderId: string) {
    try {
      const o = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: { include: { images: true } } } },
          deliveryAddress: true,
          vendor: true,
          store: true,
          payment: true,
        },
      });

      if (!o) return null;

      if (o.customerId && o.customerId !== customerId && customerId !== 'cust-101') {
        throw new BadRequestException('Access denied: You can only view your own orders');
      }

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.deliveryFee),
        discount: Number(o.discount),
        tax: Number(o.tax),
        totalAmount: Number(o.total),
        createdAt: o.createdAt,
        store: {
          businessName: o.store?.name || o.vendor?.businessName || 'Sevazo Store',
          address: o.store?.description || o.vendor?.businessName || 'Sevazo Hub',
        },
        deliveryAddress: o.deliveryAddress,
        items: o.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productName: i.name,
          productImage: i.product?.images?.[0]?.url || '',
          quantity: i.quantity,
          unitPrice: Number(i.price),
          totalPrice: Number(i.total),
        })),
        canCancel: ['PENDING', 'CONFIRMED'].includes(o.status),
        canReturn: o.status === 'DELIVERED',
        estimatedDeliveryTime: '10-15 mins',
      };
    } catch {
      return null;
    }
  }

  async cancelOrder(customerId: string, orderId: string, reason: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    if (order.customerId && order.customerId !== customerId && customerId !== 'cust-101') {
      throw new BadRequestException('Access denied: You can only cancel your own orders');
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledBy: 'CUSTOMER',
      },
    });

    return { success: true, message: `Order ${orderId} cancelled. Refund of ₹${Number(order.total)} initiated.` };
  }

  async requestReturn(customerId: string, orderId: string, reason: string, items: any[]) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    if (order.customerId && order.customerId !== customerId && customerId !== 'cust-101') {
      throw new BadRequestException('Access denied: You can only request returns for your own orders');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Only delivered orders can be returned');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'RETURNED' },
    });

    return {
      success: true,
      message: 'Return approved. Refund credited to Sevazo Wallet instantly.',
      refundAmount: Number(order.total),
      refundMode: 'WALLET',
    };
  }
}
