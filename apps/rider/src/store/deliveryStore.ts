import { create } from 'zustand';
import { DeliveryJob, AssignmentOffer } from '../types';

interface DeliveryState {
  activeDelivery: DeliveryJob | null;
  pendingOffers: AssignmentOffer[];
  history: DeliveryJob[];
  setActiveDelivery: (delivery: DeliveryJob | null) => void;
  setPendingOffers: (offers: AssignmentOffer[]) => void;
  acceptOffer: (offerId: string) => void;
  rejectOffer: (offerId: string) => void;
  updateDeliveryStatus: (status: DeliveryJob['status']) => void;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  activeDelivery: {
    id: 'del-901',
    orderId: 'ord-881',
    orderNumber: 'SVZ-20260821-4921',
    status: 'RIDER_ACCEPTED',
    pickupOtp: '4821',
    deliveryOtp: '7192',
    distanceKm: 3.8,
    estimatedMinutes: 14,
    deliveryFee: 40.0,
    riderEarning: 68.5,
    vendor: {
      name: 'Organic Harvest Fresh Store',
      phone: '+91 91234 56789',
      address: 'Shop 14, Main Market, Block C, Greater Kailash 1, New Delhi',
      latitude: 28.5494,
      longitude: 77.2341,
    },
    customer: {
      name: 'Priya Verma',
      phone: '+91 99887 76655',
      address: 'Apartment 402, Tower B, Palm Grove Heights, New Delhi',
      latitude: 28.5355,
      longitude: 77.2410,
      notes: 'Please ring bell twice and leave near doorstep shoe rack.',
    },
    items: [
      { id: 'item-1', name: 'Fresh Organic Cow Milk (1L)', quantity: 2 },
      { id: 'item-2', name: 'Alphonso Mango Box (1kg)', quantity: 1 },
      { id: 'item-3', name: 'Sourdough Artisanal Bread', quantity: 1 },
    ],
    createdAt: new Date().toISOString(),
  },
  pendingOffers: [
    {
      id: 'offer-101',
      deliveryId: 'del-902',
      distanceToStoreKm: 0.8,
      totalTripKm: 4.2,
      estimatedMinutes: 16,
      estimatedEarnings: 75.0,
      expiresInSeconds: 28,
      vendorName: 'Blue Tokai Roastery & Bakery',
      vendorAddress: 'Lane 3, Saidulajab, Saket, New Delhi',
      customerAddress: 'House 18, Block E, Saket, New Delhi',
      itemsCount: 2,
    },
  ],
  history: [],

  setActiveDelivery: (delivery) => set({ activeDelivery: delivery }),

  setPendingOffers: (offers) => set({ pendingOffers: offers }),

  acceptOffer: (offerId) =>
    set((state) => ({
      pendingOffers: state.pendingOffers.filter((o) => o.id !== offerId),
    })),

  rejectOffer: (offerId) =>
    set((state) => ({
      pendingOffers: state.pendingOffers.filter((o) => o.id !== offerId),
    })),

  updateDeliveryStatus: (status) =>
    set((state) => ({
      activeDelivery: state.activeDelivery
        ? { ...state.activeDelivery, status }
        : null,
    })),
}));

export default useDeliveryStore;
