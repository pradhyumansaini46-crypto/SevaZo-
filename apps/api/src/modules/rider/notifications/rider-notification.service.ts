import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class RiderNotificationService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(riderId: string) {
    // Generate notification list based on rider events, incentives, and announcements
    return [
      {
        id: 'notif-1',
        title: 'Peak Hour Incentive Alert 🔥',
        body: 'Earn an extra ₹15 per delivery between 7 PM - 11 PM tonight in your zone!',
        type: 'INCENTIVE',
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: 'notif-2',
        title: 'Documents Approved ✅',
        body: 'Your Aadhaar & Driving License have been verified. You can now go online.',
        type: 'KYC',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: 'notif-3',
        title: 'Weekly Payout Processed 💰',
        body: 'Your weekly settlement has been credited to your bank account.',
        type: 'PAYOUT',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  async markAsRead(riderId: string, notificationId: string) {
    return { success: true, notificationId, readAt: new Date() };
  }
}
