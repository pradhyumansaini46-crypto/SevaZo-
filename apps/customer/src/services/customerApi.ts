import { apiClient, setAuthToken } from './api';
import { tursoDb } from './tursoDatabase';
import { vendorNotificationService } from './vendorNotificationService';
import { BLINKIT_GROUPED_CATEGORIES, GroupedCategorySection } from './categoryCatalogData';
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
  HomeFeedResponse,
} from '../types';
import {
  mockDashboardSections,
  mockDeliveryContext,
  mockBanners,
  mockCategories,
  mockStores,
  mockBuyAgainProducts,
  mockAvailableNowProducts,
  mockTrendingProducts,
  mockDealProducts,
  mockRecommendedProducts,
  mockRecentlyViewedProducts,
  mockProducts,
  mockActiveOrder,
  mockNotifications,
  mockSevazoPulse,
} from './mockData';

export const customerApi = {
  // 1. Registration & Auth
  async sendOtp(phone: string, email?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post('/customer/auth/send-otp', { phone, email });
      return res.data;
    } catch {
      return { success: true, message: email ? `OTP sent to ${email}` : `OTP sent to ${phone}` };
    }
  },

  async verifyOtp(phone: string, otp: string, email?: string): Promise<AuthResponse> {
    try {
      const res = await apiClient.post('/customer/auth/verify-otp', { phone, otp, email });
      setAuthToken(res.data.token);
      return res.data;
    } catch {
      const token = `jwt-customer-${Date.now()}`;
      setAuthToken(token);
      return {
        token,
        customer: {
          id: `cust-${Date.now()}`,
          phone,
          name: '',
          email: email || '',
          isVerified: true,
          totalSpent: 0,
          ordersCount: 0,
          walletBalance: 0,
          loyaltyTier: 'BRONZE',
          createdAt: new Date().toISOString(),
        },
      };
    }
  },

  async getMe(): Promise<CustomerUser | null> {
    try {
      const res = await apiClient.get('/customer/auth/me');
      return res.data;
    } catch {
      return null;
    }
  },

  async updateProfile(data: Partial<CustomerUser>): Promise<CustomerUser> {
    try {
      const res = await apiClient.put('/customer/auth/profile', data);
      return res.data;
    } catch {
      return {
        id: `cust-${Date.now()}`,
        phone: '',
        name: '',
        email: '',
        isVerified: true,
        totalSpent: 0,
        ordersCount: 0,
        walletBalance: 0,
        loyaltyTier: 'BRONZE',
        createdAt: new Date().toISOString(),
        ...data,
      };
    }
  },

  // 1.1 Onboarding & Resume
  async getOnboardingState(): Promise<{ currentStep: string; progress: number; status: string }> {
    try {
      const res = await apiClient.get('/customer/auth/onboarding');
      return res.data;
    } catch {
      return { currentStep: 'PROFILE_SETUP', progress: 0, status: 'DRAFT' };
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
      return { preferredCategories: [] };
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
  async getAddresses(userId?: string): Promise<Address[]> {
    try {
      if (tursoDb.isConfigured()) {
        const addresses = await tursoDb.getAddresses(userId);
        if (addresses && addresses.length > 0) {
          return addresses;
        }
      }
    } catch (err) {
      console.warn('[Turso] getAddresses error:', err);
    }

    try {
      const res = await apiClient.get('/customer/auth/addresses');
      return res.data || [];
    } catch {
      return [];
    }
  },

  async saveAddress(address: Partial<Address>): Promise<Address> {
    const newAddress: Address = {
      id: address.id || `addr-${Date.now()}`,
      customerId: address.customerId || '',
      label: address.label || 'Home',
      line1: address.line1 || '',
      line2: address.line2,
      landmark: address.landmark,
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: !!address.isDefault,
      contactName: address.contactName || '',
      contactPhone: address.contactPhone || '',
    };

    try {
      if (tursoDb.isConfigured()) {
        return await tursoDb.saveAddress(newAddress);
      }
    } catch (err) {
      console.warn('[Turso] saveAddress error:', err);
    }

    try {
      const res = await apiClient.post('/customer/auth/addresses', address);
      return res.data;
    } catch {
      return newAddress;
    }
  },

  async deleteAddress(id: string): Promise<{ success: boolean }> {
    try {
      if (tursoDb.isConfigured()) {
        await tursoDb.deleteAddress(id);
        return { success: true };
      }
    } catch (err) {
      console.warn('[Turso] deleteAddress error:', err);
    }

    try {
      const res = await apiClient.delete(`/customer/auth/addresses/${id}`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  // 3. Home Feed, Catalog, Categories, Stores & Products
  async getHomeFeed(): Promise<HomeFeedResponse> {
    try {
      if (tursoDb.isConfigured()) {
        const [tursoCategories, tursoProducts] = await Promise.all([
          tursoDb.getCategories(),
          tursoDb.getProducts(),
        ]);

        if (tursoProducts && tursoProducts.length > 0) {
          return {
            sections: mockDashboardSections,
            deliveryContext: mockDeliveryContext,
            pulse: mockSevazoPulse,
            activeOrder: null,
            categories: tursoCategories.length > 0 ? tursoCategories : mockCategories,
            heroBanners: mockBanners,
            buyAgainProducts: tursoProducts.slice(0, 4),
            availableNowProducts: tursoProducts.slice(4, 10),
            topStores: mockStores,
            trendingProducts: tursoProducts.slice(0, 6),
            dealProducts: tursoProducts.filter(
              (p) => !!p.discountBadge || (p.compareAtPrice && p.compareAtPrice > p.price)
            ),
            recommendedProducts: tursoProducts.slice(2, 8),
            recentlyViewedProducts: tursoProducts.slice(1, 5),
          };
        }
      }
    } catch (err) {
      console.warn('[Turso] getHomeFeed error, falling back to API/mock:', err);
    }

    try {
      const res = await apiClient.get('/customer/catalog/home');
      return {
        sections: res.data?.sections || mockDashboardSections,
        deliveryContext: res.data?.deliveryContext || mockDeliveryContext,
        pulse: res.data?.pulse || mockSevazoPulse,
        activeOrder: res.data?.activeOrder !== undefined ? res.data.activeOrder : null,
        categories: res.data?.categories?.length ? res.data.categories : mockCategories,
        heroBanners: res.data?.heroBanners?.length ? res.data.heroBanners : mockBanners,
        buyAgainProducts: res.data?.buyAgainProducts?.length ? res.data.buyAgainProducts : mockBuyAgainProducts,
        availableNowProducts: res.data?.availableNowProducts?.length ? res.data.availableNowProducts : mockAvailableNowProducts,
        topStores: res.data?.topStores?.length ? res.data.topStores : mockStores,
        trendingProducts: res.data?.trendingProducts?.length ? res.data.trendingProducts : mockTrendingProducts,
        dealProducts: res.data?.dealProducts?.length ? res.data.dealProducts : mockDealProducts,
        recommendedProducts: res.data?.recommendedProducts?.length ? res.data.recommendedProducts : mockRecommendedProducts,
        recentlyViewedProducts: res.data?.recentlyViewedProducts?.length ? res.data.recentlyViewedProducts : mockRecentlyViewedProducts,
      };
    } catch {
      return {
        sections: mockDashboardSections,
        deliveryContext: mockDeliveryContext,
        pulse: mockSevazoPulse,
        activeOrder: null,
        categories: mockCategories,
        heroBanners: mockBanners,
        buyAgainProducts: mockBuyAgainProducts,
        availableNowProducts: mockAvailableNowProducts,
        topStores: mockStores,
        trendingProducts: mockTrendingProducts,
        dealProducts: mockDealProducts,
        recommendedProducts: mockRecommendedProducts,
        recentlyViewedProducts: mockRecentlyViewedProducts,
      };
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      if (tursoDb.isConfigured()) {
        const categories = await tursoDb.getCategories();
        if (categories && categories.length > 0) {
          return categories;
        }
      }
    } catch (err) {
      console.warn('[Turso] getCategories error:', err);
    }

    try {
      const res = await apiClient.get('/customer/catalog/categories');
      return res.data?.length ? res.data : mockCategories;
    } catch {
      return mockCategories;
    }
  },

  async getGroupedCategories(): Promise<GroupedCategorySection[]> {
    try {
      if (tursoDb.isConfigured()) {
        return await tursoDb.getGroupedCategories();
      }
    } catch (err) {
      console.warn('[Turso] getGroupedCategories error:', err);
    }
    return BLINKIT_GROUPED_CATEGORIES;
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
      if (tursoDb.isConfigured()) {
        const products = await tursoDb.getProducts(params);
        if (products && products.length > 0) {
          return products;
        }
      }
    } catch (err) {
      console.warn('[Turso] getProducts error:', err);
    }

    try {
      const res = await apiClient.get('/customer/catalog/products', { params });
      return res.data?.length ? res.data : mockProducts;
    } catch {
      if (params?.categoryId) {
        return mockProducts.filter((p) => p.categoryId === params.categoryId);
      }
      return mockProducts;
    }
  },

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      if (tursoDb.isConfigured()) {
        const product = await tursoDb.getProductById(id);
        if (product) {
          return product;
        }
      }
    } catch (err) {
      console.warn('[Turso] getProductById error:', err);
    }

    try {
      const res = await apiClient.get(`/customer/catalog/products/${id}`);
      return res.data || mockProducts.find((p) => p.id === id) || mockProducts[0];
    } catch {
      return mockProducts.find((p) => p.id === id) || mockProducts[0];
    }
  },

  async getStores(): Promise<Store[]> {
    try {
      const res = await apiClient.get('/customer/catalog/stores');
      return res.data?.length ? res.data : mockStores;
    } catch {
      return mockStores;
    }
  },

  async getStoreById(id: string): Promise<Store | undefined> {
    try {
      const res = await apiClient.get(`/customer/catalog/stores/${id}`);
      return res.data || mockStores.find((s) => s.id === id) || mockStores[0];
    } catch {
      return mockStores.find((s) => s.id === id) || mockStores[0];
    }
  },

  // 4. Search
  async search(query: string, categoryId?: string): Promise<{ products: Product[]; stores: Store[]; categories: Category[] }> {
    try {
      if (tursoDb.isConfigured()) {
        const [tursoProducts, tursoCategories] = await Promise.all([
          tursoDb.getProducts({ query, categoryId }),
          tursoDb.getCategories(),
        ]);

        const q = (query || '').toLowerCase().trim();
        const matchedCategories = tursoCategories.filter(
          (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
        );

        if (tursoProducts.length > 0 || matchedCategories.length > 0) {
          return {
            products: tursoProducts,
            stores: mockStores.filter((s) => s.businessName.toLowerCase().includes(q)),
            categories: matchedCategories,
          };
        }
      }
    } catch (err) {
      console.warn('[Turso] search error:', err);
    }

    try {
      const res = await apiClient.get('/customer/search', { params: { q: query, categoryId } });
      return {
        products: res.data?.products || [],
        stores: res.data?.stores || [],
        categories: res.data?.categories || [],
      };
    } catch {
      const q = (query || '').toLowerCase().trim();
      if (!q) {
        return { products: [], stores: [], categories: [] };
      }
      const matchedProducts = mockProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          (p.brandName && p.brandName.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
      const matchedStores = mockStores.filter(
        (s) =>
          s.businessName.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.toLowerCase().includes(q)) ||
          (s.city && s.city.toLowerCase().includes(q))
      );
      const matchedCategories = mockCategories.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      );
      return {
        products: matchedProducts,
        stores: matchedStores,
        categories: matchedCategories,
      };
    }
  },

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const res = await apiClient.get('/customer/search/suggestions', { params: { q: query } });
      return res.data || [];
    } catch {
      const q = (query || '').toLowerCase().trim();
      if (!q) return [];
      const prodNames = mockProducts
        .filter((p) => p.name.toLowerCase().includes(q))
        .map((p) => p.name);
      return Array.from(new Set(prodNames)).slice(0, 5);
    }
  },

  // 5. Cart
  async getCart(): Promise<{ items: any[]; subtotal: number; itemCount: number }> {
    try {
      const res = await apiClient.get('/customer/cart');
      return res.data || { items: [], subtotal: 0, itemCount: 0 };
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
        itemTotal: 0,
        deliveryFee: 0,
        handlingFee: 0,
        tax: 0,
        discount: 0,
        grandTotal: 0,
      };
    }
  },

  async getCoupons(): Promise<Coupon[]> {
    try {
      const res = await apiClient.get('/customer/checkout/coupons');
      return res.data || [];
    } catch {
      return [];
    }
  },

  // 7. Orders & Cancellation
  async checkout(orderPayload: any): Promise<Order> {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `SVZ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: (orderPayload.status || 'PENDING') as any, // 'PENDING' until vendor accepts
      paymentStatus: 'PAID',
      paymentMethod: orderPayload.paymentMethod || 'UPI',
      items: orderPayload.items || [],
      subtotal: orderPayload.subtotal || 0,
      deliveryFee: orderPayload.deliveryFee || 0,
      tax: orderPayload.tax || 0,
      discount: orderPayload.discount || 0,
      totalAmount: orderPayload.totalAmount || 0,
      deliveryAddress: orderPayload.address,
      store: orderPayload.store || { id: orderPayload.storeId || 'store-1', businessName: orderPayload.storeName || 'SevaZo Dark Store' },
      canCancel: true,
      canReturn: false,
    };

    const vendorId = orderPayload.vendorId || orderPayload.store?.id || newOrder.store?.id || 'vnd-001';
    const storeId = orderPayload.storeId || orderPayload.store?.id || newOrder.store?.id || 'store-1';
    const storeName = orderPayload.storeName || orderPayload.store?.businessName || newOrder.store?.businessName || 'SevaZo Dark Store';
    const customerName = orderPayload.customerName || 'Customer';
    const customerPhone = orderPayload.customerPhone || '';

    try {
      if (tursoDb.isConfigured()) {
        await tursoDb.saveOrder(newOrder, orderPayload.userId || 'default-user', {
          vendorId,
          storeId,
          storeName,
          customerName,
          customerPhone,
        });
      }
    } catch (err) {
      console.warn('[Turso] checkout saveOrder error:', err);
    }

    // Dispatch real-time request directly to Vendor
    try {
      await vendorNotificationService.dispatchOrderToVendor(newOrder, {
        vendorId,
        storeId,
        storeName,
        customerName,
        customerPhone,
      });
    } catch (err) {
      console.warn('[VendorDispatch] Dispatch failed:', err);
    }

    try {
      const res = await apiClient.post('/customer/orders', orderPayload);
      return res.data || newOrder;
    } catch {
      return newOrder;
    }
  },

  async getOrders(userId?: string): Promise<Order[]> {
    try {
      if (tursoDb.isConfigured()) {
        const orders = await tursoDb.getOrders(userId);
        if (orders && orders.length > 0) {
          return orders;
        }
      }
    } catch (err) {
      console.warn('[Turso] getOrders error:', err);
    }

    try {
      const res = await apiClient.get('/customer/orders');
      return res.data || [];
    } catch {
      return [];
    }
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    try {
      if (tursoDb.isConfigured()) {
        const orders = await tursoDb.getOrders();
        const found = orders.find((o) => o.id === id || o.orderNumber === id);
        if (found) return found;
      }
    } catch (err) {
      console.warn('[Turso] getOrderById error:', err);
    }

    try {
      const res = await apiClient.get(`/customer/orders/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async cancelOrder(id: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post(`/customer/orders/${id}/cancel`, { reason });
      return res.data;
    } catch {
      return { success: true, message: 'Order cancellation initiated.' };
    }
  },

  // 8. Returns & Refunds
  async requestReturn(payload: Partial<ReturnRequest>): Promise<ReturnRequest> {
    try {
      const res = await apiClient.post('/customer/orders/returns', payload);
      return res.data;
    } catch {
      const newReturn: ReturnRequest = {
        id: `ret-${Date.now()}`,
        orderId: payload.orderId || '',
        items: payload.items || [],
        reason: payload.reason || '',
        status: 'REQUESTED',
        createdAt: new Date().toISOString(),
      };
      return newReturn;
    }
  },

  async getRefunds(): Promise<RefundRecord[]> {
    try {
      const res = await apiClient.get('/customer/orders/refunds');
      return res.data || [];
    } catch {
      return [];
    }
  },

  // 9. Live GPS & Delivery Tracking
  async getLiveTracking(orderId: string): Promise<LiveTrackingData | null> {
    try {
      const res = await apiClient.get(`/customer/orders/${orderId}/tracking`);
      return res.data;
    } catch {
      return null;
    }
  },

  // 10. Reviews & Ratings
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const res = await apiClient.get(`/customer/reviews/product/${productId}`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  async getReviews(productId: string): Promise<Review[]> {
    return this.getProductReviews(productId);
  },

  async addProductReview(review: Partial<Review>): Promise<Review> {
    try {
      const res = await apiClient.post('/customer/reviews', review);
      return res.data;
    } catch {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        productId: review.productId || '',
        customerId: '',
        customerName: review.customerName || 'Customer',
        rating: review.rating || 5,
        comment: review.comment || '',
        verifiedPurchase: true,
        createdAt: 'Just now',
        likesCount: 0,
      };
      return newReview;
    }
  },

  async addReview(review: Partial<Review>): Promise<Review> {
    return this.addProductReview(review);
  },

  // 11. Wallet & Cashbacks
  async getWallet(): Promise<{ balance: number; transactions: WalletTransaction[] }> {
    try {
      const res = await apiClient.get('/customer/wallet');
      return res.data || { balance: 0, transactions: [] };
    } catch {
      return { balance: 0, transactions: [] };
    }
  },

  async getWalletTransactions(): Promise<WalletTransaction[]> {
    const w = await this.getWallet();
    return w.transactions || [];
  },

  async addWalletMoney(amount: number): Promise<{ success: boolean; newBalance: number }> {
    try {
      const res = await apiClient.post('/customer/wallet/topup', { amount });
      return res.data;
    } catch {
      return { success: true, newBalance: amount };
    }
  },

  async addWalletFunds(amount: number): Promise<{ success: boolean; newBalance: number }> {
    return this.addWalletMoney(amount);
  },

  // 12. Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await apiClient.get('/customer/notifications');
      return res.data?.length ? res.data : mockNotifications;
    } catch {
      return mockNotifications;
    }
  },

  async markNotificationAsRead(id: string): Promise<{ success: boolean }> {
    try {
      const res = await apiClient.patch(`/customer/notifications/${id}/read`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  // 13. Help, Support & FAQ
  async getSupportTickets(): Promise<SupportTicket[]> {
    try {
      const res = await apiClient.get('/customer/support/tickets');
      return res.data || [];
    } catch {
      return [];
    }
  },

  async createSupportTicket(data: { subject: string; message: string; orderId?: string }): Promise<SupportTicket> {
    try {
      const res = await apiClient.post('/customer/support/tickets', data);
      return res.data;
    } catch {
      const newTicket: SupportTicket = {
        id: `tkt-${Date.now()}`,
        ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: data.subject,
        status: 'OPEN',
        priority: 'MEDIUM',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: data.message,
      };
      return newTicket;
    }
  },
};
