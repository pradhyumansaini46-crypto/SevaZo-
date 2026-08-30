/**
 * SevaZo Platform Policy & Compliance Types
 */

export type PolicyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type PolicyType =
  | 'TERMS_AND_CONDITIONS'
  | 'PRIVACY_POLICY'
  | 'VENDOR_AGREEMENT'
  | 'RIDER_AGREEMENT'
  | 'CANCELLATION_POLICY'
  | 'RETURN_POLICY'
  | 'REFUND_POLICY'
  | 'DELIVERY_POLICY';

export interface PlatformPolicy {
  id: string;
  type: PolicyType;
  title: string;
  content: string;
  version: string;
  status: PolicyStatus;
  effectiveFrom: string;
  publishedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  defaultPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  slaHours: number;
  active: boolean;
}

export interface RiderOnboardingRequirement {
  id: string;
  name: string;
  code: string;
  description: string;
  mandatory: boolean;
  requiresVehicleType?: string[];
}
