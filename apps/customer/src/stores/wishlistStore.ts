import { create } from 'zustand';
import { Product } from '../types';
import { mockProducts } from '../services/mockData';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [mockProducts[0], mockProducts[2]], // Pre-fill 2 items for preview

  toggleWishlist: (product: Product) => {
    const { items } = get();
    const exists = items.some((p) => p.id === product.id);
    if (exists) {
      set({ items: items.filter((p) => p.id !== product.id) });
    } else {
      set({ items: [...items, product] });
    }
  },

  isInWishlist: (productId: string) => {
    const { items } = get();
    return items.some((p) => p.id === productId);
  },

  removeFromWishlist: (productId: string) => {
    const { items } = get();
    set({ items: items.filter((p) => p.id !== productId) });
  },

  clearWishlist: () => set({ items: [] }),
}));
