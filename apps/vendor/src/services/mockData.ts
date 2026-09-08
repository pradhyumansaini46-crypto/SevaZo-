import {
  VendorUser,
  Product,
  Order,
  InventoryLog,
  Settlement,
  NotificationItem,
} from '../types';

export const blankDraftVendor: VendorUser = {
  id: '',
  storeName: '',
  ownerName: '',
  email: '',
  phone: '',
  status: 'DRAFT',
  approvalStatus: 'PENDING',
  currentOnboardingStep: 1,
  completionPercentage: 0,
  rating: 0,
  commissionRate: 10,
  totalRevenue: 0,
  ordersCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockVendor: VendorUser = blankDraftVendor;
export const mockProducts: Product[] = [];
export const mockOrders: Order[] = [];
export const mockInventoryLogs: InventoryLog[] = [];
export const mockSettlements: Settlement[] = [];
export const mockNotifications: NotificationItem[] = [];
