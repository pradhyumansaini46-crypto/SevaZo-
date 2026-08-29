import fs from 'fs';
import path from 'path';

export interface SharedDocument {
  id: string;
  type: string;
  number: string;
  fileUrl: string;
  verified: boolean;
  expiry?: string;
}

export interface SharedRiderApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'pending' | 'blocked' | 'inactive' | 'suspended';
  approvalStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  vehicleType: string;
  vehicleNumber: string;
  zone: string;
  deliveriesCount: number;
  rating: number;
  totalEarnings: number;
  isOnline: boolean;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  banking?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  documents: SharedDocument[];
  submittedAt: string;
  createdAt?: string;
  updatedAt: string;
  draftData?: any;
}

export interface SharedVendorApplication {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  logo?: string;
  banner?: string;
  profilePhoto?: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
  category: string;
  businessType?: string;
  legalEntityType?: string;
  panNumber?: string;
  gstin?: string;
  fssaiNumber?: string;
  address: {
    id?: string;
    label?: string;
    line1: string;
    area?: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
  shopPhotos?: string[];
  productsCount: number;
  ordersCount: number;
  rating: number;
  commissionRate: number;
  totalRevenue: number;
  documents: SharedDocument[];
  schedules?: any[];
  banking?: any;
  consent?: any;
  submittedAt: string;
  updatedAt: string;
  draftData?: any;
}

export interface SharedApplicationsStore {
  riders: SharedRiderApplication[];
  vendors: SharedVendorApplication[];
}

let inMemoryStore: SharedApplicationsStore = {
  riders: [],
  vendors: [],
};

const getStoreFilePath = (): string => {
  return path.join(process.cwd(), 'shared-applications.json');
};

export const getSharedStore = (): SharedApplicationsStore => {
  try {
    const filePath = getStoreFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      inMemoryStore = {
        riders: Array.isArray(data.riders) ? data.riders : inMemoryStore.riders,
        vendors: Array.isArray(data.vendors) ? data.vendors : inMemoryStore.vendors,
      };
    }
  } catch {
    // Fall back to in-memory store in read-only / serverless environments
  }
  return inMemoryStore;
};

export const saveSharedStore = (store: SharedApplicationsStore): void => {
  inMemoryStore = store;
  try {
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem on Vercel
  }
};

export const upsertRider = (app: SharedRiderApplication): void => {
  const store = getSharedStore();
  const index = store.riders.findIndex((r) => r.id === app.id || (r.phone && r.phone === app.phone));
  if (index >= 0) {
    store.riders[index] = { ...store.riders[index], ...app, updatedAt: new Date().toISOString() };
  } else {
    store.riders.unshift(app);
  }
  saveSharedStore(store);
};

export const updateRiderStatus = (
  riderId: string,
  approvalStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED',
): SharedRiderApplication | null => {
  const store = getSharedStore();
  const rider = store.riders.find((r) => r.id === riderId);
  if (rider) {
    rider.approvalStatus = approvalStatus;
    rider.status = approvalStatus === 'APPROVED' ? 'active' : approvalStatus === 'REJECTED' ? 'blocked' : 'pending';
    rider.updatedAt = new Date().toISOString();
    saveSharedStore(store);
    return rider;
  }
  return null;
};

export const deleteRider = (riderId: string): boolean => {
  const store = getSharedStore();
  const initialLen = store.riders.length;
  store.riders = store.riders.filter((r) => r.id !== riderId);
  if (store.riders.length !== initialLen) {
    saveSharedStore(store);
    return true;
  }
  return false;
};

export const upsertVendor = (app: SharedVendorApplication): void => {
  const store = getSharedStore();
  const index = store.vendors.findIndex((v) => v.id === app.id || (v.phone && v.phone === app.phone));
  if (index >= 0) {
    store.vendors[index] = { ...store.vendors[index], ...app, updatedAt: new Date().toISOString() };
  } else {
    store.vendors.unshift(app);
  }
  saveSharedStore(store);
};

export const updateVendorStatus = (
  vendorId: string,
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'under_review',
  status?: string,
): SharedVendorApplication | null => {
  const store = getSharedStore();
  const vendor = store.vendors.find((v) => v.id === vendorId);
  if (vendor) {
    vendor.approvalStatus = approvalStatus;
    vendor.status = (status as any) || (approvalStatus === 'approved' ? 'approved' : approvalStatus === 'rejected' ? 'rejected' : 'pending');
    vendor.updatedAt = new Date().toISOString();
    saveSharedStore(store);
    return vendor;
  }
  return null;
};
