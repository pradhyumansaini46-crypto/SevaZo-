export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  profileCompleted?: boolean;
  status?: 'ACTIVE' | 'INCOMPLETE' | 'BLOCKED' | 'DELETED';
  registrationStep?: string;
  dob?: string;
  shoppingPreferences?: string[];
  totalSpent: number;
  ordersCount: number;
  walletBalance: number;
  loyaltyTier?: 'SILVER' | 'GOLD' | 'PLATINUM';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  customer: CustomerUser;
  profileCompleted?: boolean;
  nextAction?: 'OPEN_HOME' | 'RESUME_REGISTRATION' | 'WELCOME';
  currentStep?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  itemCount?: number;
  subcategories?: { id: string; name: string; slug: string; imageUrl?: string }[];
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
}

export interface Store {
  id: string;
  businessName: string;
  ownerName?: string;
  avatar?: string;
  coverImage?: string;
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  distanceKm: number;
  address: string;
  city: string;
  isOpen: boolean;
  tags: string[];
  bannerText?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g. "500g", "1kg", "Red / L"
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributes?: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  vendorId: string;
  storeId?: string;
  storeName?: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  stock: number;
  unit: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  variants?: ProductVariant[];
  tags: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  inStock: boolean;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  createdAt: string;
  likesCount?: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface Address {
  id: string;
  customerId?: string;
  label: 'Home' | 'Work' | 'Other';
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  contactName?: string;
  contactPhone?: string;
}

export interface CartItem {
  id: string; // cart item id or productId
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  unit: string;
  variantName?: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  maxStock: number;
  storeId?: string;
  storeName?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
}

export interface CartCalculation {
  itemsTotal: number;
  deliveryFee: number;
  handlingFee: number;
  taxAmount: number;
  couponDiscount: number;
  appliedCoupon?: Coupon;
  savingsTotal: number;
  grandTotal: number;
}

export type PaymentMethodType = 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'COD';

export interface PaymentOption {
  id: PaymentMethodType;
  title: string;
  subtitle: string;
  iconName: string;
  isPopular?: boolean;
  available: boolean;
}

export type OrderStatusType =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface OrderItemRecord {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatusType;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: PaymentMethodType;
  items: OrderItemRecord[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  deliveryAddress: Address;
  store: {
    id: string;
    businessName: string;
    phone?: string;
    address?: string;
  };
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  deliveryOtp?: string;
  rider?: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    rating: number;
    vehicleNumber: string;
    vehicleType: string;
  };
  canCancel: boolean;
  canReturn: boolean;
}

export interface LiveTrackingData {
  orderId: string;
  orderNumber: string;
  status: OrderStatusType;
  estimatedDeliveryTime: string;
  remainingMinutes: number;
  distanceRemainingKm: number;
  rider?: {
    id: string;
    name: string;
    phone: string;
    avatar: string;
    rating: number;
    vehicleModel: string;
    vehiclePlate: string;
    currentLat: number;
    currentLng: number;
  };
  storeLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  deliveryLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  timeline: {
    step: string;
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    current: boolean;
  }[];
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  items: { productId: string; name: string; quantity: number }[];
  reason: string;
  notes?: string;
  images?: string[];
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'PICKUP_SCHEDULED' | 'REFUNDED' | 'REJECTED';
  createdAt: string;
  refundAmount: number;
}

export interface RefundRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  reason: string;
  status: 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  payoutMode: 'SEVAZO_WALLET' | 'ORIGINAL_PAYMENT_METHOD';
  transactionRef: string;
  createdAt: string;
  completedAt?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  title: string;
  description: string;
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PROMO' | 'SYSTEM' | 'DELIVERY';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderType: 'CUSTOMER' | 'SUPPORT_AGENT' | 'BOT';
  senderName: string;
  message: string;
  timestamp: string;
}

// Navigation Param Lists
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetails: { productId: string; productName?: string };
  StoreDetails: { storeId: string; storeName?: string };
  SearchResults: { query?: string; categoryId?: string; categoryName?: string };
  Search: undefined;
  Filters: { currentFilters?: any };
  Reviews: { productId: string; productName?: string };
  Wishlist: undefined;
  Checkout: undefined;
  AddressList: { onSelectAddress?: (address: Address) => void };
  AddEditAddress: { address?: Address };
  CouponList: { onApplyCoupon?: (coupon: Coupon) => void; currentCartTotal?: number };
  Payment: { orderPayload?: any };
  OrderConfirmation: { orderId: string; orderNumber: string; estimatedTime?: string };
  OrderDetails: { orderId: string };
  LiveTracking: { orderId: string };
  Returns: { orderId?: string };
  Refunds: undefined;
  Addresses: undefined;
  Payments: undefined;
  Notifications: undefined;
  Wallet: undefined;
  Support: undefined;
  SupportChat: { ticketId?: string };
  Settings: undefined;
  SecuritySettings: undefined;
};

export interface RegistrationDraft {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  dob?: string;
  avatar?: string;
  location?: {
    latitude: number;
    longitude: number;
    formattedAddress?: string;
    city?: string;
  };
  address?: Partial<Address>;
  preferences?: string[];
  notifications?: {
    orderUpdates: boolean;
    deliveryAlerts: boolean;
    accountAlerts: boolean;
    marketingConsent: boolean;
  };
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent: boolean;
  currentStep?: string;
  progress?: number;
}

export interface CustomerOnboardingState {
  id: string;
  customerId: string;
  currentStep: 'PHONE_VERIFIED' | 'PROFILE_SETUP' | 'LOCATION_SETUP' | 'ADDRESS_SETUP' | 'PREFERENCES_SETUP' | 'CONSENT_PENDING' | 'ACTIVE';
  progress: number;
  status: 'DRAFT' | 'ACTIVE';
  completedAt?: string;
}

export interface CustomerPreferences {
  preferredCategories: string[];
  preferredLanguage: string;
  preferredCurrency: string;
}

export interface UserDeviceItem {
  id: string;
  deviceId: string;
  platform: 'IOS' | 'ANDROID' | 'WEB';
  appVersion?: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Otp: { phone: string; mode?: 'LOGIN' | 'REGISTER' };
  ResumeRegistration: undefined;
  RegisterProfile: undefined;
  RegisterLocation: undefined;
  RegisterAddress: undefined;
  RegisterPreferences: undefined;
  RegisterTerms: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};
