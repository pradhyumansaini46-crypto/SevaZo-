import * as fs from 'fs';
import * as path from 'path';

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
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
  category: string;
  address: {
    id?: string;
    label?: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  productsCount: number;
  ordersCount: number;
  rating: number;
  commissionRate: number;
  totalRevenue: number;
  documents: SharedDocument[];
  submittedAt: string;
  updatedAt: string;
  draftData?: any;
}

export interface SharedApplicationsStore {
  riders: SharedRiderApplication[];
  vendors: SharedVendorApplication[];
}

const resolveStorePath = (): string => {
  const possiblePaths = [
    path.resolve(process.cwd(), 'shared-applications.json'),
    path.resolve(process.cwd(), '../shared-applications.json'),
    '/Users/pradhyumansaini/Documents/sevzo/Sevaa1/shared-applications.json',
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return '/Users/pradhyumansaini/Documents/sevzo/Sevaa1/shared-applications.json';
};

export const readSharedStore = (): SharedApplicationsStore => {
  const filePath = resolveStorePath();
  try {
    if (!fs.existsSync(filePath)) {
      const initial: SharedApplicationsStore = { riders: [], vendors: [] };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    return {
      riders: Array.isArray(data.riders) ? data.riders : [],
      vendors: Array.isArray(data.vendors) ? data.vendors : [],
    };
  } catch (e) {
    return { riders: [], vendors: [] };
  }
};

export const writeSharedStore = (store: SharedApplicationsStore): void => {
  const filePath = resolveStorePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write shared applications store:', e);
  }
};

export const upsertRiderApplication = (app: SharedRiderApplication): void => {
  const store = readSharedStore();
  const index = store.riders.findIndex((r) => r.id === app.id || (r.phone && r.phone === app.phone));
  if (index >= 0) {
    store.riders[index] = { ...store.riders[index], ...app, updatedAt: new Date().toISOString() };
  } else {
    store.riders.unshift(app);
  }
  writeSharedStore(store);
};

export const updateRiderApplicationStatus = (
  riderId: string,
  approvalStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED',
): SharedRiderApplication | null => {
  const store = readSharedStore();
  const rider = store.riders.find((r) => r.id === riderId);
  if (rider) {
    rider.approvalStatus = approvalStatus;
    rider.status = approvalStatus === 'APPROVED' ? 'active' : approvalStatus === 'REJECTED' ? 'blocked' : 'pending';
    rider.updatedAt = new Date().toISOString();
    writeSharedStore(store);
    return rider;
  }
  return null;
};

export const upsertVendorApplication = (app: SharedVendorApplication): void => {
  const store = readSharedStore();
  const index = store.vendors.findIndex((v) => v.id === app.id || (v.phone && v.phone === app.phone));
  if (index >= 0) {
    store.vendors[index] = { ...store.vendors[index], ...app, updatedAt: new Date().toISOString() };
  } else {
    store.vendors.unshift(app);
  }
  writeSharedStore(store);
};

export const updateVendorApplicationStatus = (
  vendorId: string,
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'under_review',
): SharedVendorApplication | null => {
  const store = readSharedStore();
  const vendor = store.vendors.find((v) => v.id === vendorId);
  if (vendor) {
    vendor.approvalStatus = approvalStatus;
    vendor.status = approvalStatus === 'approved' ? 'active' : approvalStatus === 'rejected' ? 'inactive' : 'pending';
    vendor.updatedAt = new Date().toISOString();
    writeSharedStore(store);
    return vendor;
  }
  return null;
};
