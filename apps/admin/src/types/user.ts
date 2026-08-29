import { Address, Status, ApprovalStatus } from './common';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: Status;
  addresses: Address[];
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  logo?: string;
  status: Status;
  approvalStatus: ApprovalStatus;
  address: Address;
  category: string;
  productsCount: number;
  ordersCount: number;
  rating: number;
  commissionRate: number;
  totalRevenue: number;
  documents: VendorDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorDocument {
  id: string;
  type: 'gst' | 'pan' | 'fssai' | 'shop_license';
  number: string;
  fileUrl: string;
  verified: boolean;
}

export interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: Status;
  vehicleType: 'bike' | 'scooter' | 'bicycle' | 'car';
  vehicleNumber: string;
  zone: string;
  deliveriesCount: number;
  rating: number;
  totalEarnings: number;
  isOnline: boolean;
  currentLocation?: { lat: number; lng: number };
  documents: RiderDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface RiderDocument {
  id: string;
  type: 'driving_license' | 'aadhaar' | 'pan' | 'vehicle_rc';
  number: string;
  fileUrl: string;
  verified: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: Status;
  lastLogin: string;
  createdAt: string;
}
