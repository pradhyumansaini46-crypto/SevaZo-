/**
 * Sevazo Admin Role-Based Access Control (RBAC) & State Machine Definitions
 */

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'CATALOG_MANAGER'
  | 'FINANCE_MANAGER'
  | 'LOGISTICS_MANAGER'
  | 'SUPPORT_AGENT';

/**
 * Admin User Account States
 */
export type AdminAccountState =
  | 'ACTIVE'
  | 'PENDING'
  | 'LOCKED'
  | 'SUSPENDED'
  | 'DISABLED';

/**
 * Platform Setup Lifecycle States (Segregated from user account state)
 */
export type PlatformSetupState =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'READY'
  | 'ACTIVE';

/**
 * Platform Setup Section Identifiers
 */
export type SetupSectionKey =
  | 'OWNER'
  | 'PLATFORM'
  | 'SECURITY'
  | 'REGION'
  | 'COMMERCE'
  | 'TAX'
  | 'LOGISTICS'
  | 'RIDER'
  | 'PAYMENTS'
  | 'SETTLEMENT'
  | 'NOTIFICATIONS'
  | 'POLICIES'
  | 'SUPPORT'
  | 'HOURS';

export interface SetupSectionStatus {
  section: SetupSectionKey;
  isCompleted: boolean;
  completedAt?: string;
  updatedAt?: string;
}

export interface AdminPermission {
  code: string;
  name: string;
  category: 'SETUP' | 'USERS' | 'CATALOG' | 'ORDERS' | 'LOGISTICS' | 'FINANCE' | 'SECURITY' | 'SETTINGS';
  description: string;
}

export interface AdminUser {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  role: AdminRole;
  accountState: AdminAccountState;
  mfaEnabled: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  user: AdminUser;
  platformSetupState: PlatformSetupState;
  currentSetupStep: number;
  expiresAt: string;
}

/**
 * Role Permission Matrix Definitions
 */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: [
    '*', // Root Master Key (All Permissions)
  ],
  ADMIN: [
    'users.read',
    'users.write',
    'catalog.*',
    'orders.*',
    'logistics.*',
    'finance.read',
    'support.*',
    'marketing.*',
  ],
  OPERATIONS_MANAGER: [
    'orders.*',
    'logistics.deliveries.read',
    'logistics.deliveries.write',
    'logistics.tracking.read',
    'vendors.read',
    'riders.read',
    'support.tickets.*',
  ],
  CATALOG_MANAGER: [
    'catalog.categories.*',
    'catalog.brands.*',
    'catalog.products.*',
    'catalog.approval.*',
  ],
  FINANCE_MANAGER: [
    'finance.commissions.*',
    'finance.payments.*',
    'finance.refunds.*',
    'finance.settlements.*',
    'orders.read',
  ],
  LOGISTICS_MANAGER: [
    'logistics.zones.*',
    'logistics.riders.*',
    'logistics.deliveries.*',
    'logistics.tracking.*',
  ],
  SUPPORT_AGENT: [
    'support.tickets.*',
    'support.disputes.*',
    'orders.read',
    'customers.read',
    'vendors.read',
    'riders.read',
  ],
};
