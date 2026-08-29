import { Address, OrderStatus, PaymentStatus, PaymentMethod, DeliveryStatus } from './common';

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  vendor: {
    id: string;
    storeName: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: Address;
  rider?: {
    id: string;
    name: string;
    phone: string;
  };
  deliveryStatus?: DeliveryStatus;
  estimatedDelivery?: string;
  notes?: string;
  couponCode?: string;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    image: string;
  };
  variant?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  note?: string;
}
