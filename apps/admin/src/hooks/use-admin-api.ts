'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiClient } from '@/lib/api-client';
import { PaginationQuery } from '@sevazo/types';
import { toast } from 'sonner';

// 1. DASHBOARD TELEMETRY
export function useDashboardTelemetry() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'telemetry'],
    queryFn: () => adminApiClient.dashboard.getTelemetry(),
    refetchInterval: 30000, // Real-time poll every 30s
  });
}

// 2. CUSTOMERS
export function useCustomersList(query?: PaginationQuery) {
  return useQuery({
    queryKey: ['admin', 'customers', query],
    queryFn: () => adminApiClient.customers.list(query),
  });
}

export function useCustomerDetails(id: string) {
  return useQuery({
    queryKey: ['admin', 'customers', id],
    queryFn: () => adminApiClient.customers.getById(id),
    enabled: Boolean(id),
  });
}

// 3. VENDORS & KYC
export function useVendorsList(query?: PaginationQuery) {
  return useQuery({
    queryKey: ['admin', 'vendors', query],
    queryFn: () => adminApiClient.vendors.list(query),
  });
}

export function useVendorDetails(id: string) {
  return useQuery({
    queryKey: ['admin', 'vendors', id],
    queryFn: () => adminApiClient.vendors.getById(id),
    enabled: Boolean(id),
  });
}

export function useReviewVendorKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; rejectionReason?: string; commissionRate?: number } }) =>
      adminApiClient.vendors.reviewKyc(id, data),
    onSuccess: (_, variables) => {
      toast.success(`Vendor application marked as ${variables.data.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update vendor KYC status');
    },
  });
}

// 4. RIDERS & KYC
export function useRidersList(query?: PaginationQuery) {
  return useQuery({
    queryKey: ['admin', 'riders', query],
    queryFn: () => adminApiClient.riders.list(query),
  });
}

export function useRiderDetails(id: string) {
  return useQuery({
    queryKey: ['admin', 'riders', id],
    queryFn: () => adminApiClient.riders.getById(id),
    enabled: Boolean(id),
  });
}

export function useReviewRiderKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; rejectionReason?: string } }) =>
      adminApiClient.riders.reviewKyc(id, data),
    onSuccess: (_, variables) => {
      toast.success(`Rider application marked as ${variables.data.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update rider KYC status');
    },
  });
}

// 5. CATALOG
export function useCategoriesList() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApiClient.catalog.categories.list(),
  });
}

export function useBrandsList() {
  return useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: () => adminApiClient.catalog.brands.list(),
  });
}

export function useProductsList(query?: PaginationQuery) {
  return useQuery({
    queryKey: ['admin', 'products', query],
    queryFn: () => adminApiClient.catalog.products.list(query),
  });
}

export function useModerateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { isApproved: boolean; isActive?: boolean } }) =>
      adminApiClient.catalog.products.moderate(id, data),
    onSuccess: () => {
      toast.success('Product moderation updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

// 6. ORDERS
export function useOrdersList(query?: PaginationQuery) {
  return useQuery({
    queryKey: ['admin', 'orders', query],
    queryFn: () => adminApiClient.orders.list(query),
  });
}

export function useOrderDetails(id: string) {
  return useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => adminApiClient.orders.getById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      adminApiClient.orders.updateStatus(id, status, notes),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

// 7. FINANCE
export function usePaymentsList(query?: PaginationQuery) {
  return useQuery({
    queryKey: ['admin', 'payments', query],
    queryFn: () => adminApiClient.finance.payments(query),
  });
}

export function useRefundsList(query?: PaginationQuery) {
  return useQuery({
    queryKey: ['admin', 'refunds', query],
    queryFn: () => adminApiClient.finance.refunds(query),
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { orderId: string; amount: number; reason: string; status: string }) =>
      adminApiClient.finance.processRefund(data),
    onSuccess: () => {
      toast.success('Refund processed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] });
    },
  });
}

export function useSettlementsList(query?: PaginationQuery) {
  return useQuery({
    queryKey: ['admin', 'settlements', query],
    queryFn: () => adminApiClient.finance.settlements(query),
  });
}

export function useApproveSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApiClient.finance.approveSettlement(id),
    onSuccess: () => {
      toast.success('Settlement approved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settlements'] });
    },
  });
}

// 8. AUDIT & SETTINGS
export function useAuditLogs(query?: PaginationQuery) {
  return useQuery({
    queryKey: ['admin', 'audit', query],
    queryFn: () => adminApiClient.audit.getLogs(query),
  });
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApiClient.settings.get(),
  });
}
