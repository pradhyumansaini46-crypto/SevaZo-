'use client';

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'CATALOG_MANAGER'
  | 'FINANCE_MANAGER'
  | 'LOGISTICS_MANAGER'
  | 'SUPPORT_AGENT';

export type AdminStatus = 'ACTIVE' | 'MFA_PENDING' | 'SUSPENDED' | 'DISABLED';

export type SetupStatus = 'INCOMPLETE' | 'COMPLETED';

export type PlatformLifecycle = 'SETUP' | 'READY' | 'ACTIVE';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  role: AdminRole;
  status: AdminStatus;
  setupStatus: SetupStatus;
  currentStep: number;
  avatarUrl?: string;
}

export interface PlatformConfig {
  // Step 1: Owner Profile
  owner: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    role: AdminRole;
  };
  // Step 2: Platform Profile
  platform: {
    name: string;
    legalName: string;
    businessEmail: string;
    businessPhone: string;
    website: string;
    supportEmail: string;
    supportPhone: string;
    cinNumber: string;
    gstinNumber: string;
  };
  // Step 3: Branding
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
  };
  // Step 4 & 5: Security
  security: {
    mfaRequired: boolean;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    auditLogging: boolean;
    ipWhitelistEnabled: boolean;
    recoveryCodes: string[];
    codesDownloaded: boolean;
  };
  // Step 6 & 7: Region & Service Areas
  region: {
    country: string;
    currency: string;
    currencySymbol: string;
    timezone: string;
    defaultLanguage: string;
    primaryCity: string;
    zones: Array<{ id: string; name: string; postalCodes: string; active: boolean }>;
  };
  // Step 8, 9 & 10: Commerce, Commission & Tax
  commerce: {
    marketplaceModel: string;
    minOrderValue: number;
    maxOrderValue: number;
    cancellationWindowMinutes: number;
    returnWindowDays: number;
    defaultCommissionRate: number;
    foodCommissionRate: number;
    electronicsCommissionRate: number;
    defaultGstRate: number;
    pricingTaxMode: 'INCLUSIVE' | 'EXCLUSIVE';
  };
  // Step 11, 12 & 13: Logistics & Dispatch
  logistics: {
    baseDeliveryFee: number;
    perKmDistanceFee: number;
    freeDeliveryThreshold: number;
    estimatedDeliveryMinutes: number;
    allowedVehicles: string[];
    dispatchMode: 'AUTOMATIC' | 'MANUAL' | 'HYBRID';
    offerTimeoutSeconds: number;
    maxReassignmentAttempts: number;
  };
  // Step 14, 15 & 16: Finance, Refunds & Settlements
  finance: {
    enabledGateways: string[];
    gatewayMode: 'SANDBOX' | 'PRODUCTION';
    autoRefundPreAcceptance: boolean;
    refundApprovalThreshold: number;
    vendorSettlementCycle: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    riderSettlementCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    settlementHoldHours: number;
  };
  // Step 17 & 18: Notifications & Providers
  notifications: {
    pushEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    smsProvider: string;
    emailProvider: string;
  };
  // Step 19 & 20: Policies & Support
  legal: {
    termsVersion: string;
    privacyVersion: string;
    vendorAgreementVersion: string;
    riderAgreementVersion: string;
    supportHours: string;
    criticalSlaMinutes: number;
    standardSlaHours: number;
  };
  // Step 21: Business & Operating Hours
  businessHours: {
    is24x7Platform: boolean;
    marketplaceOpen: string;
    marketplaceClose: string;
    logisticsOpen: string;
    logisticsClose: string;
    operatingDays: string[];
  };
}

export const defaultPlatformConfig: PlatformConfig = {
  owner: {
    firstName: 'Pradhyuman',
    lastName: 'Saini',
    email: 'owner@sevazo.com',
    phone: '+91 98765 43210',
    jobTitle: 'Founder & CEO',
    role: 'SUPER_ADMIN',
  },
  platform: {
    name: 'SevaZo',
    legalName: 'SevaZo Technologies Private Limited',
    businessEmail: 'contact@sevazo.com',
    businessPhone: '+91 141 2345678',
    website: 'https://sevazo.com',
    supportEmail: 'support@sevazo.com',
    supportPhone: '+91 1800 123 4567',
    cinNumber: 'U72900RJ2026PTC089123',
    gstinNumber: '08AAACS1234F1Z5',
  },
  branding: {
    primaryColor: '#0D9488',
    secondaryColor: '#C026D3',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
  },
  security: {
    mfaRequired: true,
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
    auditLogging: true,
    ipWhitelistEnabled: false,
    recoveryCodes: [
      '8F2A-9K3L',
      '4B7C-1M9P',
      '6H3N-5T8V',
      '2R9W-7X4Q',
      '3K8L-9Z2B',
      '7P4M-1C6H',
      '5T8V-3N9R',
      '1M9P-8F2A',
    ],
    codesDownloaded: false,
  },
  region: {
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    defaultLanguage: 'English',
    primaryCity: 'Jaipur',
    zones: [
      { id: 'zn-01', name: 'Mansarovar Zone', postalCodes: '302020', active: true },
      { id: 'zn-02', name: 'Vaishali Nagar Zone', postalCodes: '302021', active: true },
      { id: 'zn-03', name: 'Malviya Nagar Zone', postalCodes: '302017', active: true },
      { id: 'zn-04', name: 'Jagatpura Zone', postalCodes: '302017', active: true },
    ],
  },
  commerce: {
    marketplaceModel: 'Multi-Vendor Marketplace',
    minOrderValue: 99,
    maxOrderValue: 25000,
    cancellationWindowMinutes: 5,
    returnWindowDays: 7,
    defaultCommissionRate: 10,
    foodCommissionRate: 12,
    electronicsCommissionRate: 8,
    defaultGstRate: 18,
    pricingTaxMode: 'INCLUSIVE',
  },
  logistics: {
    baseDeliveryFee: 30,
    perKmDistanceFee: 8,
    freeDeliveryThreshold: 499,
    estimatedDeliveryMinutes: 30,
    allowedVehicles: ['Motorcycle', 'Scooter', 'Electric Vehicle', 'Bicycle'],
    dispatchMode: 'HYBRID',
    offerTimeoutSeconds: 30,
    maxReassignmentAttempts: 3,
  },
  finance: {
    enabledGateways: ['Razorpay (UPI / Cards / Netbanking)', 'Cash on Delivery (COD)'],
    gatewayMode: 'SANDBOX',
    autoRefundPreAcceptance: true,
    refundApprovalThreshold: 1000,
    vendorSettlementCycle: 'WEEKLY',
    riderSettlementCycle: 'WEEKLY',
    settlementHoldHours: 24,
  },
  notifications: {
    pushEnabled: true,
    smsEnabled: true,
    emailEnabled: true,
    inAppEnabled: true,
    smsProvider: 'Twilio / MSG91',
    emailProvider: 'SendGrid / AWS SES',
  },
  legal: {
    termsVersion: 'v1.0 (2026)',
    privacyVersion: 'v1.0 (2026)',
    vendorAgreementVersion: 'v1.0 (2026)',
    riderAgreementVersion: 'v1.0 (2026)',
    supportHours: '24x7 Priority Operations',
    criticalSlaMinutes: 15,
    standardSlaHours: 2,
  },
  businessHours: {
    is24x7Platform: false,
    marketplaceOpen: '09:00',
    marketplaceClose: '22:00',
    logisticsOpen: '08:00',
    logisticsClose: '23:00',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
};

const STORAGE_KEY_SESSION = 'sevazo_admin_session';
const STORAGE_KEY_CONFIG = 'sevazo_platform_config';

export function getStoredSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredSession(session: AdminUser | null) {
  if (typeof window === 'undefined') return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem('sevazo_admin_token');
  } else {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    localStorage.setItem('sevazo_admin_token', `adm_jwt_${session.id}`);
  }
}

export function getStoredPlatformConfig(): PlatformConfig {
  if (typeof window === 'undefined') return defaultPlatformConfig;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return defaultPlatformConfig;
    return { ...defaultPlatformConfig, ...JSON.parse(raw) };
  } catch {
    return defaultPlatformConfig;
  }
}

export function setStoredPlatformConfig(config: PlatformConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}
