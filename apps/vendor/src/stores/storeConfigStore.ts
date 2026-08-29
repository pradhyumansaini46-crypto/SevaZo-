import { create } from 'zustand';

interface StoreConfigState {
  isOpen: boolean;
  prepTimeMinutes: number;
  deliveryRadiusKm: number;
  holidayMode: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setPrepTime: (minutes: number) => void;
  setDeliveryRadius: (km: number) => void;
  toggleHolidayMode: () => void;
}

export const useStoreConfigStore = create<StoreConfigState>((set) => ({
  isOpen: true,
  prepTimeMinutes: 15,
  deliveryRadiusKm: 8.5,
  holidayMode: false,

  setIsOpen: (isOpen) => set({ isOpen }),
  setPrepTime: (prepTimeMinutes) => set({ prepTimeMinutes }),
  setDeliveryRadius: (deliveryRadiusKm) => set({ deliveryRadiusKm }),
  toggleHolidayMode: () => set((state) => ({ holidayMode: !state.holidayMode })),
}));
