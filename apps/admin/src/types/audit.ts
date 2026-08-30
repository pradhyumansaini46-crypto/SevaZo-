/**
 * SevaZo Admin Action Audit Logging Definitions
 */

export type AdminActionType =
  | 'VENDOR_APPROVED'
  | 'VENDOR_REJECTED'
  | 'VENDOR_SUSPENDED'
  | 'RIDER_APPROVED'
  | 'RIDER_SUSPENDED'
  | 'REFUND_APPROVED'
  | 'REFUND_REJECTED'
  | 'COMMISSION_CHANGED'
  | 'BANK_ACCOUNT_CHANGED'
  | 'ROLE_CHANGED'
  | 'ADMIN_CREATED'
  | 'ADMIN_DEACTIVATED'
  | 'POLICY_PUBLISHED'
  | 'SETTINGS_UPDATED'
  | 'SECURITY_MFA_RESET'
  | 'SYSTEM_ACTIVATED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET';

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  action: AdminActionType;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown> | string | null;
  newValue?: Record<string, unknown> | string | null;
  ipAddress: string;
  userAgent: string;
  requestId: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, unknown>;
}
