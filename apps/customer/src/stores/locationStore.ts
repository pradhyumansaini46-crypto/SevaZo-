import { create } from 'zustand';
import { Address } from '../types';
import { mockAddresses } from '../services/mockData';

interface LocationState {
  currentAddress: Address;
  savedAddresses: Address[];
  setCurrentAddress: (address: Address) => void;
  addAddress: (address: Address) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentAddress: mockAddresses[0],
  savedAddresses: mockAddresses,

  setCurrentAddress: (address: Address) => set({ currentAddress: address }),

  addAddress: (address: Address) => {
    const { savedAddresses } = get();
    const updated = address.isDefault
      ? savedAddresses.map((a) => ({ ...a, isDefault: false }))
      : [...savedAddresses];
    set({
      savedAddresses: [address, ...updated],
      currentAddress: address.isDefault ? address : get().currentAddress,
    });
  },

  updateAddress: (address: Address) => {
    const { savedAddresses } = get();
    const updated = savedAddresses.map((a) => (a.id === address.id ? address : a));
    set({
      savedAddresses: updated,
      currentAddress: get().currentAddress.id === address.id ? address : get().currentAddress,
    });
  },

  deleteAddress: (id: string) => {
    const { savedAddresses } = get();
    const filtered = savedAddresses.filter((a) => a.id !== id);
    set({
      savedAddresses: filtered,
      currentAddress: get().currentAddress.id === id ? filtered[0] || mockAddresses[0] : get().currentAddress,
    });
  },

  setDefaultAddress: (id: string) => {
    const { savedAddresses } = get();
    const updated = savedAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    const target = updated.find((a) => a.id === id);
    set({
      savedAddresses: updated,
      currentAddress: target || get().currentAddress,
    });
  },
}));
