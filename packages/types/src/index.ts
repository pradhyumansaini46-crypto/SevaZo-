// -----------------------------------------------------------------------------
// SEVAZO UNIFIED DOMAIN TYPES & INTERFACES
// -----------------------------------------------------------------------------

// 1. STANDARD API ENVELOPES
export interface ApiResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  requestId: string;
  timestamp?: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: any;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  requestId: string;
  timestamp?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

// 2. ADMIN IDENTITY & RBAC
export type AdminRoleType =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'CATALOG_MANAGER'
  | 'FINANCE_MANAGER'
  | 'LOGISTICS_MANAGER'
  | 'SUPPORT_AGENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DELETED';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  status: UserStatus;
  roleId: string;
  role: Role;
  mfaEnabled: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  permissions?: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  action: string;      // e.g. "users:read", "orders:cancel"
  module: string;      // e.g. "orders", "vendors", "settlements"
  description?: string | null;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission?: Permission;
}

export interface AdminSession {
  id: string;
  adminId: string;
  tokenHash: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId?: string | null;
  adminName?: string | null;
  adminEmail?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

// 3. VENDOR DOMAIN
export type VendorStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Vendor {
  id: string;
  businessName: string;
  legalName?: string | null;
  email: string;
  phone: string;
  logo?: string | null;
  status: VendorStatus;
  commissionRate: number;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  rejectionReason?: string | null;
  stores?: Store[];
  documents?: VendorDocument[];
  bankAccount?: VendorBankAccount | null;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorDocument {
  id: string;
  vendorId: string;
  type: 'GST_CERTIFICATE' | 'FSSAI_LICENSE' | 'PAN_CARD' | 'BANK_STATEMENT' | 'TRADE_LICENSE';
  documentNumber: string;
  fileUrl: string;
  verified: boolean;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorBankAccount {
  id: string;
  vendorId: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  isVerified: boolean;
  createdAt: string;
}

// 4. RIDER DOMAIN
export type RiderStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type VehicleType = 'BIKE' | 'SCOOTER' | 'BICYCLE' | 'ELECTRIC_VEHICLE' | 'CAR' | 'VAN';

export interface Rider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string | null;
  status: RiderStatus;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  rejectionReason?: string | null;
  vehicles?: RiderVehicle[];
  documents?: RiderDocument[];
  currentLocation?: RiderLocation | null;
  createdAt: string;
  updatedAt: string;
}

export interface RiderVehicle {
  id: string;
  riderId: string;
  type: VehicleType;
  registrationNumber: string;
  model: string;
  isActive: boolean;
  createdAt: string;
}

export interface RiderDocument {
  id: string;
  riderId: string;
  type: 'DRIVING_LICENSE' | 'VEHICLE_RC' | 'AADHAAR_CARD' | 'PAN_CARD' | 'INSURANCE';
  documentNumber: string;
  fileUrl: string;
  verified: boolean;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface RiderLocation {
  id: string;
  riderId: string;
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  updatedAt: string;
}

// 5. CUSTOMER DOMAIN
export interface Customer {
  id: string;
  phone: string;
  email?: string | null;
  name: string;
  avatar?: string | null;
  status: UserStatus;
  walletBalance: number;
  totalOrders: number;
  totalSpent: number;
  addresses?: CustomerAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

// 6. CATALOG DOMAIN
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  isActive: boolean;
  displayOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  vendorId: string;
  vendor?: { id: string; businessName: string };
  categoryId: string;
  category?: Category;
  brandId?: string | null;
  brand?: Brand | null;
  basePrice: number;
  compareAtPrice?: number | null;
  isApproved: boolean;
  isActive: boolean;
  sku: string;
  rating: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  inventory?: Inventory | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  attributes: Record<string, any>;
}

export interface Inventory {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
  updatedAt: string;
}

// 7. ORDER & LOGISTICS DOMAIN
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type DeliveryStatus =
  | 'PENDING_ASSIGNMENT'
  | 'ASSIGNMENT_OFFERED'
  | 'RIDER_ACCEPTED'
  | 'RIDER_AT_VENDOR'
  | 'PICKUP_VERIFIED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'RIDER_AT_CUSTOMER'
  | 'DELIVERY_VERIFIED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED'
  | 'RETURNED';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  vendorId: string;
  vendor?: Vendor;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  items?: OrderItem[];
  delivery?: Delivery | null;
  shippingAddress: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  variantTitle?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  riderId?: string | null;
  rider?: Rider | null;
  status: DeliveryStatus;
  pickupOtp?: string | null;
  deliveryOtp?: string | null;
  pickupTime?: string | null;
  deliveredTime?: string | null;
  distanceKm?: number | null;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

// 8. FINANCE DOMAIN
export interface Payment {
  id: string;
  orderId: string;
  orderNumber?: string;
  amount: number;
  currency: string;
  method: string;
  gateway: string;
  gatewayTransactionId?: string | null;
  status: PaymentStatus;
  createdAt: string;
}

export interface Refund {
  id: string;
  orderId: string;
  orderNumber?: string;
  amount: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  processedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  vendorId: string;
  vendorName?: string;
  amount: number;
  commissionDeducted: number;
  netPayout: number;
  status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'ON_HOLD' | 'FAILED';
  periodStart: string;
  periodEnd: string;
  payoutDate?: string | null;
  createdAt: string;
}

export interface Commission {
  id: string;
  categoryId?: string | null;
  vendorId?: string | null;
  percentage: number;
  flatFee: number;
  isActive: boolean;
}

// 9. MARKETING & SUPPORT DOMAIN
export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_DELIVERY';
  value: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userType: 'CUSTOMER' | 'VENDOR' | 'RIDER';
  userName?: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
}

// 10. ADMIN DASHBOARD KPI TELEMETRY
export interface DashboardTelemetry {
  kpis: {
    totalCustomers: number;
    activeVendors: number;
    activeRiders: number;
    todayOrders: number;
    todayRevenue: number;
    pendingVendorApprovals: number;
    pendingRiderApprovals: number;
    pendingRefunds: number;
    pendingSettlements: number;
  };
  charts: {
    revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
    ordersTrend: Array<{ date: string; completed: number; cancelled: number }>;
    customerSignups: Array<{ date: string; count: number }>;
    vendorGrowth: Array<{ date: string; active: number; pending: number }>;
    riderGrowth: Array<{ date: string; active: number; online: number }>;
    deliverySuccess: Array<{ status: string; percentage: number }>;
  };
  recentOrders: Order[];
}
