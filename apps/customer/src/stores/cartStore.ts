import { create } from 'zustand';
import { CartItem, Product, ProductVariant, Coupon, CartCalculation } from '../types';

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  deliveryInstruction: string;
  setDeliveryInstruction: (instruction: string) => void;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  getItemQuantity: (productId: string, variantId?: string) => number;
  getCalculation: () => CartCalculation;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [
    // Pre-populate with 2 items for preview convenience
    {
      id: 'prod-1',
      productId: 'prod-1',
      variantId: 'v-1',
      name: 'Fresh Hydroponic English Spinach (Palak)',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200',
      unit: '250 g',
      variantName: '250 g',
      price: 38,
      compareAtPrice: 55,
      quantity: 2,
      maxStock: 45,
      storeId: 'store-1',
      storeName: 'SevaZo Supermart Express',
    },
    {
      id: 'prod-2',
      productId: 'prod-2',
      variantId: 'v-4',
      name: 'Amul Taaza Homogenised Toned Milk',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
      unit: '1 Litre',
      variantName: '1 Litre',
      price: 54,
      compareAtPrice: 56,
      quantity: 1,
      maxStock: 120,
      storeId: 'store-1',
      storeName: 'SevaZo Supermart Express',
    },
  ],
  appliedCoupon: {
    id: 'c-1',
    code: 'SEVAZO50',
    description: 'Flat 50% OFF up to ₹100 on orders above ₹199',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    minOrderAmount: 199,
    maxDiscount: 100,
    validUntil: '2026-12-31',
    isActive: true,
  },
  deliveryInstruction: 'Leave at doorstep and ring bell once',

  setDeliveryInstruction: (instruction: string) => set({ deliveryInstruction: instruction }),

  addItem: (product: Product, variant?: ProductVariant, quantity = 1) => {
    const { items } = get();
    const itemId = variant ? `${product.id}-${variant.id}` : product.id;
    const existingIndex = items.findIndex((i) => i.id === itemId);

    const price = variant ? variant.price : product.price;
    const compareAtPrice = variant ? variant.compareAtPrice : product.compareAtPrice;
    const image = product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      set({ items: updated });
    } else {
      const newItem: CartItem = {
        id: itemId,
        productId: product.id,
        variantId: variant?.id,
        name: product.name,
        image,
        unit: product.unit,
        variantName: variant?.name,
        price,
        compareAtPrice,
        quantity,
        maxStock: variant ? variant.stock : product.stock,
        storeId: product.storeId,
        storeName: product.storeName,
      };
      set({ items: [...items, newItem] });
    }
  },

  incrementItem: (id: string) => {
    const { items } = get();
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    set({ items: updated });
  },

  decrementItem: (id: string) => {
    const { items } = get();
    const existing = items.find((i) => i.id === id);
    if (!existing) return;

    if (existing.quantity <= 1) {
      set({ items: items.filter((i) => i.id !== id) });
    } else {
      const updated = items.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      set({ items: updated });
    }
  },

  removeItem: (id: string) => {
    const { items } = get();
    set({ items: items.filter((i) => i.id !== id) });
  },

  clearCart: () => set({ items: [], appliedCoupon: null }),

  applyCoupon: (coupon: Coupon) => set({ appliedCoupon: coupon }),

  removeCoupon: () => set({ appliedCoupon: null }),

  getItemQuantity: (productId: string, variantId?: string) => {
    const { items } = get();
    const itemId = variantId ? `${productId}-${variantId}` : productId;
    const item = items.find((i) => i.id === itemId || i.productId === productId);
    return item ? item.quantity : 0;
  },

  getTotalCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getCalculation: (): CartCalculation => {
    const { items, appliedCoupon } = get();

    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const originalTotal = items.reduce(
      (sum, item) => sum + (item.compareAtPrice || item.price) * item.quantity,
      0
    );

    const deliveryFee = itemsTotal >= 199 || itemsTotal === 0 ? 0 : 25;
    const handlingFee = itemsTotal > 0 ? 4 : 0;
    const taxAmount = Math.round(itemsTotal * 0.05);

    let couponDiscount = 0;
    if (appliedCoupon && itemsTotal >= appliedCoupon.minOrderAmount) {
      if (appliedCoupon.discountType === 'PERCENTAGE') {
        const disc = (itemsTotal * appliedCoupon.discountValue) / 100;
        couponDiscount = appliedCoupon.maxDiscount ? Math.min(disc, appliedCoupon.maxDiscount) : disc;
      } else {
        couponDiscount = appliedCoupon.discountValue;
      }
      couponDiscount = Math.round(couponDiscount);
    }

    const mrpSavings = Math.max(0, originalTotal - itemsTotal);
    const savingsTotal = mrpSavings + couponDiscount + (itemsTotal >= 199 ? 25 : 0);
    const grandTotal = Math.max(0, itemsTotal + deliveryFee + handlingFee + taxAmount - couponDiscount);

    return {
      itemsTotal,
      deliveryFee,
      handlingFee,
      taxAmount,
      couponDiscount,
      appliedCoupon: couponDiscount > 0 ? appliedCoupon || undefined : undefined,
      savingsTotal,
      grandTotal,
    };
  },
}));
