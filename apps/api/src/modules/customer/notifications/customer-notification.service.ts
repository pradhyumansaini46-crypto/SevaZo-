import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CustomerNotificationService {
  constructor(private prisma: PrismaService) {}

  async registerDevice(customerId: string, token: string, platform: string, appVersion?: string) {
    const existing = await this.prisma.userDevice.findUnique({ where: { token } });

    if (existing) {
      return this.prisma.userDevice.update({
        where: { id: existing.id },
        data: { customerId, platform, appVersion, isActive: true },
      });
    }

    return this.prisma.userDevice.create({
      data: { customerId, token, platform, appVersion },
    });
  }

  async getNotifications(customerId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.body,
      type: n.type,
      isRead: n.isRead,
      orderId: n.orderId,
      data: n.data,
      timestamp: n.createdAt,
    }));
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(customerId: string) {
    await this.prisma.notification.updateMany({
      where: { customerId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { success: true, message: 'All notifications marked as read' };
  }

  async createNotification(customerId: string, title: string, body: string, type: string, orderId?: string, data?: any) {
    return this.prisma.notification.create({
      data: {
        customerId,
        title,
        body,
        type,
        orderId: orderId || null,
        data: data || null,
      },
    });
  }
}
