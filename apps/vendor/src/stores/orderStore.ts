import { create } from 'zustand';

interface OrderStoreState {
  activeTab: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'HISTORY';
  pendingOrdersCount: number;
  activeOrdersCount: number;
  isAlertSoundEnabled: boolean;
  hasIncomingAlert: boolean;
  setActiveTab: (tab: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'HISTORY') => void;
  setCounts: (pending: number, active: number) => void;
  toggleAlertSound: () => void;
  triggerIncomingAlert: () => void;
  dismissIncomingAlert: () => void;
}

export const useOrderStore = create<OrderStoreState>((set) => ({
  activeTab: 'NEW',
  pendingOrdersCount: 1,
  activeOrdersCount: 3,
  isAlertSoundEnabled: true,
  hasIncomingAlert: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setCounts: (pendingOrdersCount, activeOrdersCount) =>
    set({ pendingOrdersCount, activeOrdersCount }),
  toggleAlertSound: () =>
    set((state) => ({ isAlertSoundEnabled: !state.isAlertSoundEnabled })),
  triggerIncomingAlert: () => set({ hasIncomingAlert: true }),
  dismissIncomingAlert: () => set({ hasIncomingAlert: false }),
}));
