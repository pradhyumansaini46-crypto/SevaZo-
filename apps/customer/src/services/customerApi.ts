import { apiClient, setAuthToken } from './api';
import {
  CustomerUser,
  AuthResponse,
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
  ReturnRequest,
  RefundRecord,
} from '../types';
import {
  mockCustomer,
  mockBanners,
  mockCategories,
  mockStores,
  mockProducts,
  mockReviews,
  mockAddresses,
  mockCoupons,
  mockOrders,
  mockLiveTracking,
  mockWalletTransactions,
  mockNotifications,
  mockSupportTickets,
} from './mockData';

export const customerApi = {
  // 1. Registration & Auth
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post('/customer/auth/send-otp', { phone });
      return res.data;
    } catch {
      return { success: true, message: `OTP sent successfully to ${phone}` };
    }
  },

  async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    try {
      const res = await apiClient.post('/customer/auth/verify-otp', { phone, otp });
      setAuthToken(res.data.token);
      return res.data;
    } catch {
      const token = 'mock-jwt-customer-token-12345';
      setAuthToken(token);
      return {
        token,
        customer: { ...mockCustomer, phone },
      };
    }
  },

  async getMe(): Promise<CustomerUser> {
    try {
      const res = await apiClient.get('/customer/auth/me');
      return res.data;
    } catch {
      return mockCustomer;
    }
  },

  async updateProfile(data: Partial<CustomerUser>): Promise<CustomerUser> {
    try {
      const res = await apiClient.put('/customer/auth/profile', data);
      return res.data;
    } catch {
      return { ...mockCustomer, ...data };
    }
  },

  // 1.1 Onboarding & Resume
  async getOnboardingState(): Promise<{ currentStep: string; progress: number; status: string }> {
    try {
      const res = await apiClient.get('/customer/auth/onboarding');
      return res.data;
    } catch {
      return { currentStep: 'PROFILE_SETUP', progress: 25, status: 'DRAFT' };
    }
  },

  async updateOnboardingStep(data: any): Promise<any> {
    try {
      const res = await apiClient.put('/customer/auth/onboarding', data);
      return res.data;
    } catch {
      return { success: true, ...data };
    }
  },

  async completeOnboarding(payload: any): Promise<any> {
    try {
      const res = await apiClient.post('/customer/auth/onboarding/complete', payload);
      return res.data;
    } catch {
      return {
        success: true,
        status: 'ACTIVE',
        message: 'Account successfully activated! Welcome to SevaZo.',
        nextRoute: 'HOME',
      };
    }
  },

  async deleteAccount(): Promise<any> {
    try {
      const res = await apiClient.delete('/customer/auth/account');
      return res.data;
    } catch {
      return { success: true, message: 'Account deletion request processed.' };
    }
  },

  // 1.2 Preferences & Notifications
  async getPreferences(): Promise<any> {
    try {
      const res = await apiClient.get('/customer/auth/preferences');
      return res.data;
    } catch {
      return { preferredCategories: ['Grocery', 'Dairy'] };
    }
  },

  async updatePreferences(data: any): Promise<any> {
    try {
      const res = await apiClient.put('/customer/auth/preferences', data);
      return res.data;
    } catch {
      return { success: true, ...data };
    }
  },

  async getNotificationPreferences(): Promise<any> {
    try {
      const res = await apiClient.get('/customer/auth/notification-preferences');
      return res.data;
    } catch {
      return { orderUpdates: true, deliveryAlerts: true, accountAlerts: true, marketingConsent: false };
    }
  },

  async updateNotificationPreferences(data: any): Promise<any> {
    try {
      const res = await apiClient.put('/customer/auth/notification-preferences', data);
      return res.data;
    } catch {
      return { success: true, ...data };
    }
  },

  // 1.3 Device Management & Security
  async getDevices(): Promise<any[]> {
    try {
      const res = await apiClient.get('/customer/auth/devices');
      return res.data;
    } catch {
      return [];
    }
  },

  async logoutAllDevices(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post('/customer/auth/devices/logout-all');
      return res.data;
    } catch {
      return { success: true, message: 'Logged out from other devices.' };
    }
  },

  // 2. Location & Addresses
  async getAddresses(): Promise<Address[]> {
    try {
      const res = await apiClient.get('/customer/auth/addresses');
      return res.data;
    } catch {
      return mockAddresses;
    }
  },

  async saveAddress(address: Partial<Address>): Promise<Address> {
    try {
      const res = await apiClient.post('/customer/auth/addresses', address);
      return res.data;
    } catch {
      const newAddress: Address = {
        id: address.id || `addr-${Date.now()}`,
        customerId: mockCustomer.id,
        label: address.label || 'Home',
        line1: address.line1 || 'Indiranagar 100ft Road',
        line2: address.line2,
        landmark: address.landmark,
        city: address.city || 'Bengaluru',
        state: address.state || 'Karnataka',
        pincode: address.pincode || '560038',
        latitude: address.latitude || 12.9716,
        longitude: address.longitude || 77.5946,
        isDefault: !!address.isDefault,
        contactName: address.contactName || mockCustomer.name,
        contactPhone: address.contactPhone || mockCustomer.phone,
      };
      return newAddress;
    }
  },

  async deleteAddress(id: string): Promise<{ success: boolean }> {
    try {
      const res = await apiClient.delete(`/customer/auth/addresses/${id}`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  // 3. Home Feed, Catalog, Categories, Stores & Products
  async getHomeFeed(): Promise<{
    banners: typeof mockBanners;
    categories: Category[];
    trendingProducts: Product[];
    topStores: Store[];
    flashDeals: Product[];
  }> {
    try {
      const res = await apiClient.get('/customer/catalog/home');
      return res.data;
    } catch {
      return {
        banners: mockBanners,
        categories: mockCategories,
        trendingProducts: mockProducts.filter((p) => p.isTrending),
        topStores: mockStores,
        flashDeals: mockProducts.filter((p) => p.discountPercent && p.discountPercent >= 15),
      };
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await apiClient.get('/customer/catalog/categories');
      return res.data;
    } catch {
      return mockCategories;
    }
  },

  async getProducts(params?: {
    categoryId?: string;
    storeId?: string;
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStockOnly?: boolean;
    sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating';
  }): Promise<Product[]> {
    try {
      const res = await apiClient.get('/customer/catalog/products', { params });
      return res.data;
    } catch {
      let filtered = [...mockProducts];

      if (params?.categoryId) {
        filtered = filtered.filter((p) => p.categoryId === params.categoryId);
      }
      if (params?.storeId) {
        filtered = filtered.filter((p) => p.storeId === params.storeId);
      }
      if (params?.query) {
        const q = params.query.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (params?.minPrice !== undefined) {
        filtered = filtered.filter((p) => p.price >= params.minPrice!);
      }
      if (params?.maxPrice !== undefined) {
        filtered = filtered.filter((p) => p.price <= params.maxPrice!);
      }
      if (params?.minRating !== undefined) {
        filtered = filtered.filter((p) => p.rating >= params.minRating!);
      }
      if (params?.inStockOnly) {
        filtered = filtered.filter((p) => p.inStock);
      }

      if (params?.sortBy === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (params?.sortBy === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (params?.sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      }

      return filtered;
    }
  },

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const res = await apiClient.get(`/customer/catalog/products/${id}`);
      return res.data;
    } catch {
      return mockProducts.find((p) => p.id === id) || mockProducts[0];
    }
  },

  async getStores(): Promise<Store[]> {
    try {
      const res = await apiClient.get('/customer/catalog/stores');
      return res.data;
    } catch {
      return mockStores;
    }
  },

  async getStoreById(id: string): Promise<Store | undefined> {
    try {
      const res = await apiClient.get(`/customer/catalog/stores/${id}`);
      return res.data;
    } catch {
      return mockStores.find((s) => s.id === id) || mockStores[0];
    }
  },

  // 4. Search
  async search(query: string, categoryId?: string): Promise<{ products: Product[]; stores: Store[]; categories: Category[] }> {
    try {
      const res = await apiClient.get('/customer/search', { params: { q: query, categoryId } });
      return res.data;
    } catch {
      const q = query.toLowerCase();
      return {
        products: mockProducts.filter((p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))),
        stores: mockStores.filter((s) => s.businessName.toLowerCase().includes(q)),
        categories: mockCategories.filter((c) => c.name.toLowerCase().includes(q)),
      };
    }
  },

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const res = await apiClient.get('/customer/search/suggestions', { params: { q: query } });
      return res.data;
    } catch {
      return ['Organic Milk', 'Brown Bread', 'Avocado Hass', 'Greek Yogurt', 'Dark Roast Coffee'].filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  // 5. Cart
  async getCart(): Promise<{ items: any[]; subtotal: number; itemCount: number }> {
    try {
      const res = await apiClient.get('/customer/cart');
      return res.data;
    } catch {
      return { items: [], subtotal: 0, itemCount: 0 };
    }
  },

  async addToCart(productId: string, quantity = 1): Promise<any> {
    try {
      const res = await apiClient.post('/customer/cart/items', { productId, quantity });
      return res.data;
    } catch {
      return { success: true };
    }
  },

  // 6. Checkout & Coupons
  async calculateBill(params: { addressId?: string; couponCode?: string }): Promise<any> {
    try {
      const res = await apiClient.post('/customer/checkout/calculate', params);
      return res.data;
    } catch {
      return {
        itemTotal: 340,
        deliveryFee: 0,
        handlingFee: 5,
        tax: 17,
        discount: 50,
        grandTotal: 312,
      };
    }
  },

  async getCoupons(): Promise<Coupon[]> {
    try {
      const res = await apiClient.get('/customer/checkout/coupons');
      return res.data;
    } catch {
      return mockCoupons;
    }
  },

  // 7. Orders & Cancellation
  async checkout(orderPayload: any): Promise<Order> {
    try {
      const res = await apiClient.post('/customer/orders', orderPayload);
      return res.data;
    } catch {
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `SVZ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: orderPayload.paymentMethod || 'UPI',
        items: orderPayload.items || [],
        subtotal: orderPayload.subtotal || 250,
        deliveryFee: orderPayload.deliveryFee || 15,
        tax: orderPayload.tax || 10,
        discount: orderPayload.discount || 0,
        totalAmount: orderPayload.totalAmount || 275,
        deliveryAddress: orderPayload.address || mockAddresses[0],
        store: {
          id: 'store-1',
          businessName: 'SevaZo Supermart Express',
          address: 'Plot 44, 100ft Road, Indiranagar',
        },
        estimatedDeliveryTime: 'in 15-20 mins',
        deliveryOtp: '7491',
        canCancel: true,
        canReturn: false,
      };
      return newOrder;
    }
  },

  async getOrders(): Promise<Order[]> {
    try {
      const res = await apiClient.get('/customer/orders');
      return res.data;
    } catch {
      return mockOrders;
    }
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    try {
      const res = await apiClient.get(`/customer/orders/${id}`);
      return res.data;
    } catch {
      return mockOrders.find((o) => o.id === id) || mockOrders[0];
    }
  },

  async cancelOrder(orderId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post(`/customer/orders/${orderId}/cancel`, { reason });
      return res.data;
    } catch {
      return { success: true, message: 'Order cancelled successfully. Refund initiated.' };
    }
  },

  // 8. Order Tracking & Rider Tracking
  async getLiveTracking(orderId: string): Promise<LiveTrackingData> {
    try {
      const res = await apiClient.get(`/customer/tracking/${orderId}`);
      return res.data;
    } catch {
      return mockLiveTracking;
    }
  },

  async verifyDeliveryOtp(orderId: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post(`/customer/tracking/${orderId}/verify-otp`, { otp });
      return res.data;
    } catch {
      return { success: true, message: 'Delivery verified successfully!' };
    }
  },

  // 9. Returns & Refunds
  async requestReturn(payload: Partial<ReturnRequest>): Promise<ReturnRequest> {
    try {
      const res = await apiClient.post(`/customer/orders/${payload.orderId}/return`, payload);
      return res.data;
    } catch {
      return {
        id: `ret-${Date.now()}`,
        orderId: payload.orderId || 'ord-1002',
        orderNumber: payload.orderNumber || 'SVZ-20260819-4411',
        items: payload.items || [],
        reason: payload.reason || 'Damaged packaging',
        status: 'PENDING_APPROVAL',
        createdAt: 'Just now',
        refundAmount: payload.refundAmount || 130,
      };
    }
  },

  async getRefunds(): Promise<RefundRecord[]> {
    try {
      const res = await apiClient.get('/customer/orders');
      const returnedOrders = (res.data || []).filter((o: any) => o.status === 'RETURNED' || o.status === 'CANCELLED');
      return returnedOrders.map((o: any) => ({
        id: `ref-${o.id}`,
        orderId: o.id,
        orderNumber: o.orderNumber,
        amount: o.totalAmount,
        reason: 'Refund for order',
        status: 'COMPLETED',
        payoutMode: 'SEVAZO_WALLET',
        transactionRef: `TXN-RF-${o.id.slice(-6)}`,
        createdAt: o.createdAt,
        completedAt: o.createdAt,
      }));
    } catch {
      return [
        {
          id: 'ref-1',
          orderId: 'ord-1002',
          orderNumber: 'SVZ-20260819-4411',
          amount: 130,
          reason: 'Quality issue with bakery loaf',
          status: 'COMPLETED',
          payoutMode: 'SEVAZO_WALLET',
          transactionRef: 'TXN-RF-90218',
          createdAt: '19 Aug 2026',
          completedAt: '19 Aug 2026, 11:30 AM',
        },
      ];
    }
  },

  // 10. Reviews
  async getReviews(productId: string): Promise<Review[]> {
    try {
      const res = await apiClient.get(`/customer/reviews/product/${productId}`);
      return res.data?.reviews || mockReviews;
    } catch {
      return mockReviews;
    }
  },

  async addReview(review: Partial<Review>): Promise<Review> {
    try {
      const res = await apiClient.post('/customer/reviews', review);
      return res.data;
    } catch {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        productId: review.productId || 'prod-1',
        customerId: mockCustomer.id,
        customerName: mockCustomer.name,
        customerAvatar: mockCustomer.avatar,
        rating: review.rating || 5,
        comment: review.comment || '',
        verifiedPurchase: true,
        createdAt: 'Just now',
        likesCount: 0,
      };
      return newReview;
    }
  },

  // 11. Payments & Wallet
  async getWallet(): Promise<{ balance: number; currency: string; cashbackRate: number }> {
    try {
      const res = await apiClient.get('/customer/payments/wallet');
      return res.data;
    } catch {
      return { balance: mockCustomer.walletBalance, currency: 'INR', cashbackRate: 5 };
    }
  },

  async getWalletTransactions(): Promise<WalletTransaction[]> {
    try {
      const res = await apiClient.get('/customer/payments/wallet');
      return mockWalletTransactions;
    } catch {
      return mockWalletTransactions;
    }
  },

  async addWalletFunds(amount: number): Promise<{ success: boolean; newBalance: number }> {
    try {
      const res = await apiClient.post('/customer/payments/wallet/add', { amount });
      return res.data;
    } catch {
      return { success: true, newBalance: mockCustomer.walletBalance + amount };
    }
  },

  // 12. Wishlist
  async getWishlist(): Promise<any> {
    try {
      const res = await apiClient.get('/customer/wishlist');
      return res.data;
    } catch {
      return { items: [], itemCount: 0 };
    }
  },

  async toggleWishlist(productId: string): Promise<{ inWishlist: boolean }> {
    try {
      const res = await apiClient.post('/customer/wishlist/toggle', { productId });
      return res.data;
    } catch {
      return { inWishlist: true };
    }
  },

  // 13. Notifications & Devices
  async registerDevice(token: string, platform: string): Promise<any> {
    try {
      const res = await apiClient.post('/customer/devices/register', { token, platform });
      return res.data;
    } catch {
      return { success: true };
    }
  },

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await apiClient.get('/customer/notifications');
      return res.data;
    } catch {
      return mockNotifications;
    }
  },

  async markNotificationRead(id: string): Promise<any> {
    try {
      const res = await apiClient.put(`/customer/notifications/${id}/read`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  // 14. Support & Helpdesk
  async getSupportTickets(): Promise<SupportTicket[]> {
    try {
      const res = await apiClient.get('/customer/support/tickets');
      return res.data;
    } catch {
      return mockSupportTickets;
    }
  },

  async createSupportTicket(subject: string, description: string): Promise<SupportTicket> {
    try {
      const res = await apiClient.post('/customer/support/tickets', { subject, description });
      return res.data;
    } catch {
      return {
        id: `tkt-${Date.now()}`,
        ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        subject,
        status: 'OPEN',
        priority: 'MEDIUM',
        createdAt: 'Just now',
        updatedAt: 'Just now',
        lastMessage: description,
      };
    }
  },

  async getFaqs(): Promise<any[]> {
    try {
      const res = await apiClient.get('/customer/support/faqs');
      return res.data;
    } catch {
      return [];
    }
  },
};
