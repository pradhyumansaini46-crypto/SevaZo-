import { Injectable } from '@nestjs/common';

@Injectable()
export class VendorNotificationService {
  async getNotifications(vendorId: string) {
    return [
      {
        id: 'n-1',
        title: 'New Quick Delivery Order 🔔',
        message: 'Order #SVZ-2026-9812 has arrived. Please accept within 2 minutes.',
        type: 'ORDER',
        timestamp: 'Just now',
        read: false,
      },
      {
        id: 'n-2',
        title: 'Low Stock Alert ⚠️',
        message: 'Farm Fresh Organic Whole Milk (1L) is below 5 units.',
        type: 'INVENTORY',
        timestamp: '15 mins ago',
        read: false,
      },
      {
        id: 'n-3',
        title: 'Bank Settlement Credited 💰',
        message: '₹48,920 transferred to HDFC Bank (UTR: HDFC202608189876).',
        type: 'FINANCE',
        timestamp: 'Yesterday',
        read: true,
      },
      {
        id: 'n-4',
        title: 'KYC Verification Update 🛡️',
        message: 'FSSAI License & GSTIN have been validated by Sevazo compliance team.',
        type: 'COMPLIANCE',
        timestamp: '2 days ago',
        read: true,
      },
    ];
  }
}
