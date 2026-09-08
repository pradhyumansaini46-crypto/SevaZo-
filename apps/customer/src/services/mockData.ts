import {
  CustomerUser,
  Category,
  Store,
  Product,
  Review,
  Address,
  Coupon,
  Order,
  LiveTrackingData,
  WalletTransaction,
  NotificationItem,
  SupportTicket,
} from '../types';

export const mockCustomer: CustomerUser = {
  id: '',
  name: '',
  phone: '',
  email: '',
  avatar: '',
  isVerified: false,
  totalSpent: 0,
  ordersCount: 0,
  walletBalance: 0,
  loyaltyTier: 'BRONZE',
  createdAt: new Date().toISOString(),
};

export const mockBanners: any[] = [];
export const mockCategories: Category[] = [];
export const mockStores: Store[] = [];
export const mockProducts: Product[] = [];
export const mockReviews: Review[] = [];
export const mockAddresses: Address[] = [];
export const mockCoupons: Coupon[] = [];
export const mockOrders: Order[] = [];
export const mockLiveTracking: LiveTrackingData | null = null as any;
export const mockWalletTransactions: WalletTransaction[] = [];
export const mockNotifications: NotificationItem[] = [];
export const mockSupportTickets: SupportTicket[] = [];
