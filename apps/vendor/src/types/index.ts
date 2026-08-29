export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DELETED';
export type VendorStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type LegalEntityType = 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'LLP' | 'PVT_LTD';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';

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

export type DeliveryStatus =
  | 'ASSIGNED'
  | 'ARRIVED_AT_VENDOR'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_CUSTOMER'
  | 'DELIVERED'
  | 'FAILED'
  | 'REASSIGNED';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'WALLET';
export type SettlementStatus = 'PENDING' | 'PROCESSING' | 'SETTLED' | 'ON_HOLD' | 'FAILED';

export interface Address {
  id?: string;
  line1: string;
  line2?: string | null;
  area?: string | null;
  locality?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface VendorAddress {
  id?: string;
  vendorId?: string;
  label: string;
  line1: string;
  line2?: string | null;
  area?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
}

export type DocumentStatus =
  | 'NOT_UPLOADED'
  | 'UPLOADED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export interface VendorDocument {
  id?: string;
  vendorId?: string;
  type: string;
  documentNumber: string;
  fileUrl: string;
  fileKey?: string | null;
  status?: DocumentStatus;
  documentExpiry?: string | null;
  rejectionReason?: string | null;
  verified?: boolean;
  verifiedAt?: string | null;
}

export interface BankAccount {
  accountNumber?: string;
  maskedAccountNumber?: string | null;
  ifsc?: string;
  accountHolder: string;
  bankName?: string;
  branchName?: string | null;
  accountType?: string;
  payoutPreference?: 'BANK_ACCOUNT' | 'UPI' | string;
  upiId?: string | null;
  upiVerifiedName?: string | null;
}

export interface VendorBankAccount {
  id?: string;
  vendorId?: string;
  bankName: string;
  branchName?: string | null;
  accountNumber: string;
  maskedAccountNumber?: string | null;
  ifsc: string;
  accountHolder: string;
  accountType: string;
  upiId?: string | null;
  isVerified?: boolean;
  isPrimary?: boolean;
}

export interface VendorBusinessHours {
  id?: string;
  storeId?: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  slotIntervalMinutes?: number;
}

export interface Store {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  isOpen: boolean;
  isAcceptingOrders: boolean;
  prepTimeMinutes: number;
  deliveryRadiusKm: number;
  commissionRate: number;
  rating: number;
  ordersCount: number;
  businessHours?: VendorBusinessHours[];
}

export interface StoreHoursMap {
  [day: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export type BusinessType =
  | 'RETAIL_STORE'
  | 'GROCERY_STORE'
  | 'RESTAURANT'
  | 'PHARMACY'
  | 'ELECTRONICS'
  | 'FASHION'
  | 'BEAUTY'
  | 'HOME_LIVING'
  | 'LOCAL_SERVICES'
  | 'OTHER';

export interface VendorUser {
  id: string;
  phone: string;
  email: string;
  ownerName: string;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  profilePhoto?: string | null;
  businessName?: string | null;
  displayName?: string | null;
  businessType?: string | null;
  businessCategory?: string | null;
  legalEntityType?: LegalEntityType | null;
  yearEstablished?: string | null;
  businessDescription?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  website?: string | null;
  avatar?: string | null;

  // Category-specific fields
  foodCategory?: string | null;
  kitchenType?: string | null;
  drugLicenseNumber?: string | null;
  pharmacistName?: string | null;
  pharmacistRegNumber?: string | null;
  tradeLicenseNumber?: string | null;
  panNumber?: string | null;
  gstin?: string | null;
  fssaiNumber?: string | null;

  // Payout preferences
  payoutPreference?: string | null;
  upiId?: string | null;

  // Delivery handling preferences
  pickupInstructions?: string | null;
  packagingType?: string | null;
  temperatureHandling?: string | null;
  isFragile?: boolean;
  isBulky?: boolean;
  specialHandling?: string | null;

  // Agreement Audit
  agreementVersion?: string | null;
  agreedAt?: string | null;
  agreementIp?: string | null;

  status: VendorStatus;
  currentOnboardingStep: number;
  completionPercentage?: number;
  serviceAreaPincodes?: string[];
  deliveryPreference?: string;
  rejectionReason?: string | null;
  rejectionDetails?: any;
  nextAction?: string;
  rating: number;
  commissionRate: number;
  totalRevenue: number;
  ordersCount: number;

  // Compatibility helpers
  storeName?: string;
  logo?: string | null;
  banner?: string | null;
  description?: string | null;
  isOpen?: boolean;
  openingTime?: string | null;
  closingTime?: string | null;
  storeHours?: StoreHoursMap | null;
  prepTimeMinutes?: number;
  deliveryRadiusKm?: number;
  bankAccount?: BankAccount | null;
  approvalStatus?: ApprovalStatus;

  address?: Address | null;
  addresses?: VendorAddress[];
  documents?: VendorDocument[];
  bankAccounts?: VendorBankAccount[];
  stores?: Store[];
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingState {
  vendorId: string;
  phone: string;
  email?: string;
  status: VendorStatus;
  currentStep: number;
  completionPercentage: number;
  nextAction?: string;
  rejectionReason?: string | null;
  rejectionDetails?: any;
  checklist: {
    step1_businessType: boolean;
    step2_ownerDetails: boolean;
    step3_businessDetails: boolean;
    step4_businessAddress: boolean;
    step5_documents: boolean;
    step6_bankAccount: boolean;
    step7_storeDetails: boolean;
    step8_deliveryPreferences: boolean;
    step9_submitted: boolean;
  };
  data?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  weightGrams?: number | null;
  stock: number;
  attributes?: Record<string, any>;
}

export interface ProductImage {
  id: string;
  productId?: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Inventory {
  id: string;
  storeId: string;
  productId: string;
  variantId?: string | null;
  sku: string;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  damagedStock: number;
  soldStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category?: Category;
  brandId?: string | null;
  brand?: Brand | null;
  vendorId: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  taxRate?: number;
  hsnCode?: string | null;
  weightGrams?: number | null;
  sku: string;
  stock: number;
  physicalStock?: number;
  reservedStock?: number;
  availableStock?: number;
  damagedStock?: number;
  soldStock?: number;
  unit: string;
  status: UserStatus;
  approvalStatus: ApprovalStatus;
  rating: number;
  reviewsCount: number;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  vendorId?: string;
  productId: string;
  product?: { id: string; name: string; sku: string; images: ProductImage[] };
  variantId?: string | null;
  variant?: { id: string; name: string; sku: string } | null;
  changeQty: number;
  previousStock: number;
  newStock: number;
  reason: string;
  notes?: string | null;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: { id: string; name: string; images: ProductImage[] };
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  avatar?: string | null;
  vehicleType?: string;
  vehicleNumber: string;
  rating: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  riderId?: string | null;
  rider?: Rider | null;
  status: DeliveryStatus;
  distanceKm?: number | null;
  deliveryFee: number;
  pickupTime?: string | null;
  deliveredTime?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: { id: string; name: string; phone: string; email?: string };
  vendorId: string;
  deliveryAddress: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: string | null;
  items: OrderItem[];
  delivery?: Delivery | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  vendorId: string;
  periodStart: string;
  periodEnd: string;
  totalGrossSales: number;
  totalCommission: number;
  netPayout: number;
  status: SettlementStatus;
  bankReference?: string | null;
  settledAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface Commission {
  id: string;
  orderId: string;
  order?: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    createdAt: string;
  };
  orderAmount: number;
  ratePercent: number;
  commissionFee: number;
  vendorPayout: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_DELIVERY';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle?: string | null;
  bannerUrl?: string | null;
  targetType: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SupportTicketMessage {
  id: string;
  senderType: 'CUSTOMER' | 'ADMIN' | 'VENDOR';
  senderId: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  messages: SupportTicketMessage[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'ORDER' | 'INVENTORY' | 'FINANCE' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Navigation Stack Param Lists
export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerification: { phone: string; isRegister?: boolean; returnScreen?: string };
  OnboardingWizard: { initialStep?: number; isResume?: boolean } | undefined;
  ApplicationSubmitted: undefined;
  StatusTracker: undefined;
  StoreApproved: undefined;
  Correction: undefined;
  Suspended: undefined;
  BusinessSetup: undefined;
  Kyc: undefined;
  ApprovalPending: undefined;
};

export type OnboardingStackParamList = {
  OnboardingWizard: { initialStep?: number; isResume?: boolean } | undefined;
  ApplicationSubmitted: undefined;
  StatusTracker: undefined;
  StoreApproved: undefined;
  Correction: undefined;
  Suspended: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Orders: { initialTab?: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'HISTORY' } | undefined;
  Products: undefined;
  Inventory: undefined;
  Store: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: { initialStep?: number } | undefined;
  OnboardingWizard: { initialStep?: number; isResume?: boolean } | undefined;
  ApplicationSubmitted: undefined;
  StatusTracker: undefined;
  StoreApproved: undefined;
  Correction: undefined;
  Suspended: undefined;
  Main: undefined;
  AddProduct: { productId?: string } | undefined;
  EditProduct: { productId: string };
  ProductVariants: { productId: string };
  ProductImages: { productId: string };
  StockAdjustment: { productId?: string; variantId?: string };
  LowStock: undefined;
  OrderDetail: { orderId: string };
  StoreProfile: undefined;
  StoreHours: undefined;
  StoreStatus: undefined;
  Revenue: undefined;
  Transactions: undefined;
  Settlements: undefined;
  Promotions: undefined;
  Analytics: undefined;
  Notifications: undefined;
  Support: undefined;
  Settings: undefined;
};
