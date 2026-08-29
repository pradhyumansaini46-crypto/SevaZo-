import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  ApiResponse,
  PaginatedResult,
  PaginationQuery,
  AdminUser,
  DashboardTelemetry,
  Customer,
  Vendor,
  Rider,
  Category,
  Brand,
  Product,
  Order,
  Payment,
  Refund,
  Settlement,
  SupportTicket,
  AuditLog,
} from '@sevazo/types';

export interface ApiClientOptions {
  baseURL?: string;
  getToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: () => void;
}

export class SevazoAdminClient {
  private client: AxiosInstance;

  constructor(options: ApiClientOptions = {}) {
    const baseURL = options.baseURL || (typeof window !== 'undefined' ? '' : 'http://localhost:4000');

    this.client = axios.create({
      baseURL: `${baseURL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    // Request interceptor to attach JWT token
    this.client.interceptors.request.use(async (config) => {
      if (options.getToken) {
        const token = await options.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      (error) => {
        if (error.response?.status === 401 && options.onUnauthorized) {
          options.onUnauthorized();
        }
        return Promise.reject(error.response?.data?.error || error);
      }
    );
  }

  // Generic Request Helper
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const res = await this.client.request<ApiResponse<T>>(config);
    return res.data.data;
  }

  // 1. AUTH
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<{ token: string; refreshToken: string; admin: AdminUser }>({
        url: '/admin/auth/login',
        method: 'POST',
        data: credentials,
      }),
    verifyMfa: (data: { email: string; code: string }) =>
      this.request<{ token: string; refreshToken: string; admin: AdminUser }>({
        url: '/admin/auth/mfa/verify',
        method: 'POST',
        data,
      }),
    me: () =>
      this.request<AdminUser>({
        url: '/admin/auth/me',
        method: 'GET',
      }),
    logout: () =>
      this.request<{ success: boolean }>({
        url: '/admin/auth/logout',
        method: 'POST',
      }),
  };

  // 2. DASHBOARD
  dashboard = {
    getTelemetry: () =>
      this.request<DashboardTelemetry>({
        url: '/admin/analytics/dashboard',
        method: 'GET',
      }),
  };

  // 3. CUSTOMERS
  customers = {
    list: (query?: PaginationQuery) =>
      this.request<PaginatedResult<Customer>>({
        url: '/admin/customers',
        method: 'GET',
        params: query,
      }),
    getById: (id: string) =>
      this.request<Customer>({
        url: `/admin/customers/${id}`,
        method: 'GET',
      }),
    updateStatus: (id: string, status: string) =>
      this.request<Customer>({
        url: `/admin/customers/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
  };

  // 4. VENDORS & KYC
  vendors = {
    list: (query?: PaginationQuery) =>
      this.request<PaginatedResult<Vendor>>({
        url: '/admin/vendors',
        method: 'GET',
        params: query,
      }),
    getById: (id: string) =>
      this.request<Vendor>({
        url: `/admin/vendors/${id}`,
        method: 'GET',
      }),
    reviewKyc: (id: string, data: { status: string; rejectionReason?: string; commissionRate?: number }) =>
      this.request<Vendor>({
        url: `/admin/vendors/${id}/kyc`,
        method: 'PATCH',
        data,
      }),
  };

  // 5. RIDERS & KYC
  riders = {
    list: (query?: PaginationQuery) =>
      this.request<PaginatedResult<Rider>>({
        url: '/admin/riders',
        method: 'GET',
        params: query,
      }),
    getById: (id: string) =>
      this.request<Rider>({
        url: `/admin/riders/${id}`,
        method: 'GET',
      }),
    reviewKyc: (id: string, data: { status: string; rejectionReason?: string }) =>
      this.request<Rider>({
        url: `/admin/riders/${id}/kyc`,
        method: 'PATCH',
        data,
      }),
  };

  // 6. CATALOG
  catalog = {
    categories: {
      list: () => this.request<Category[]>({ url: '/admin/categories', method: 'GET' }),
      create: (data: Partial<Category>) =>
        this.request<Category>({ url: '/admin/categories', method: 'POST', data }),
      update: (id: string, data: Partial<Category>) =>
        this.request<Category>({ url: `/admin/categories/${id}`, method: 'PATCH', data }),
    },
    brands: {
      list: () => this.request<Brand[]>({ url: '/admin/brands', method: 'GET' }),
      create: (data: Partial<Brand>) =>
        this.request<Brand>({ url: '/admin/brands', method: 'POST', data }),
    },
    products: {
      list: (query?: PaginationQuery) =>
        this.request<PaginatedResult<Product>>({ url: '/admin/products', method: 'GET', params: query }),
      getById: (id: string) =>
        this.request<Product>({ url: `/admin/products/${id}`, method: 'GET' }),
      moderate: (id: string, data: { isApproved: boolean; isActive?: boolean }) =>
        this.request<Product>({ url: `/admin/products/${id}/moderate`, method: 'PATCH', data }),
    },
  };

  // 7. ORDERS & DELIVERIES
  orders = {
    list: (query?: PaginationQuery) =>
      this.request<PaginatedResult<Order>>({
        url: '/admin/orders',
        method: 'GET',
        params: query,
      }),
    getById: (id: string) =>
      this.request<Order>({
        url: `/admin/orders/${id}`,
        method: 'GET',
      }),
    updateStatus: (id: string, status: string, notes?: string) =>
      this.request<Order>({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        data: { status, notes },
      }),
  };

  // 8. FINANCE
  finance = {
    payments: (query?: PaginationQuery) =>
      this.request<PaginatedResult<Payment>>({ url: '/admin/payments', method: 'GET', params: query }),
    refunds: (query?: PaginationQuery) =>
      this.request<PaginatedResult<Refund>>({ url: '/admin/refunds', method: 'GET', params: query }),
    processRefund: (data: { orderId: string; amount: number; reason: string; status: string }) =>
      this.request<Refund>({ url: '/admin/refunds/process', method: 'POST', data }),
    settlements: (query?: PaginationQuery) =>
      this.request<PaginatedResult<Settlement>>({ url: '/admin/settlements', method: 'GET', params: query }),
    approveSettlement: (id: string) =>
      this.request<Settlement>({ url: `/admin/settlements/${id}/approve`, method: 'POST' }),
  };

  // 9. SUPPORT
  support = {
    tickets: (query?: PaginationQuery) =>
      this.request<PaginatedResult<SupportTicket>>({ url: '/admin/support/tickets', method: 'GET', params: query }),
    getTicketById: (id: string) =>
      this.request<SupportTicket>({ url: `/admin/support/tickets/${id}`, method: 'GET' }),
    updateTicketStatus: (id: string, status: string) =>
      this.request<SupportTicket>({ url: `/admin/support/tickets/${id}/status`, method: 'PATCH', data: { status } }),
  };

  // 10. AUDIT & SETTINGS
  audit = {
    getLogs: (query?: PaginationQuery) =>
      this.request<PaginatedResult<AuditLog>>({ url: '/admin/audit', method: 'GET', params: query }),
  };

  settings = {
    get: () => this.request<Record<string, any>>({ url: '/admin/settings', method: 'GET' }),
    update: (data: Record<string, any>) =>
      this.request<Record<string, any>>({ url: '/admin/settings', method: 'PUT', data }),
  };
}

export const createAdminApiClient = (options?: ApiClientOptions) => new SevazoAdminClient(options);
