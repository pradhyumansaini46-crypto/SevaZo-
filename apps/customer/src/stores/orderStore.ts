import { create } from 'zustand';
import { Order, LiveTrackingData, ReturnRequest } from '../types';
import { mockOrders, mockLiveTracking } from '../services/mockData';
import { customerApi } from '../services/customerApi';

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  activeTracking: LiveTrackingData | null;
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  placeOrder: (payload: any) => Promise<Order>;
  cancelOrder: (orderId: string, reason: string) => Promise<boolean>;
  requestReturn: (payload: Partial<ReturnRequest>) => Promise<boolean>;
  fetchTracking: (orderId: string) => Promise<LiveTrackingData>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: mockOrders,
  activeOrder: mockOrders[0],
  activeTracking: mockLiveTracking,
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const orders = await customerApi.getOrders();
      set({ orders, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  placeOrder: async (payload: any) => {
    set({ isLoading: true });
    try {
      const newOrder = await customerApi.checkout(payload);
      const updated = [newOrder, ...get().orders];
      set({
        orders: updated,
        activeOrder: newOrder,
        isLoading: false,
      });
      return newOrder;
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  cancelOrder: async (orderId: string, reason: string) => {
    try {
      await customerApi.cancelOrder(orderId, reason);
      const updated = get().orders.map((o) =>
        o.id === orderId ? { ...o, status: 'CANCELLED' as const, canCancel: false } : o
      );
      set({ orders: updated });
      return true;
    } catch {
      return false;
    }
  },

  requestReturn: async (payload: Partial<ReturnRequest>) => {
    try {
      await customerApi.requestReturn(payload);
      return true;
    } catch {
      return false;
    }
  },

  fetchTracking: async (orderId: string) => {
    try {
      const data = await customerApi.getLiveTracking(orderId);
      set({ activeTracking: data });
      return data;
    } catch {
      return mockLiveTracking;
    }
  },
}));
