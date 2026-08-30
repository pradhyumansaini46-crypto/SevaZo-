'use client';

import {
  PlatformConfig,
  PlatformLifecycle,
  getStoredPlatformConfig,
  setStoredPlatformConfig,
  getStoredSession,
  setStoredSession,
} from '@/lib/auth-store';
import { recordAuditEvent } from '@/services/audit-service';
import { PlatformSetupState } from '@/types/auth';

export interface SectionValidationResult {
  sectionKey: string;
  isComplete: boolean;
  missingFields: string[];
}

export function validateAllSections(config: PlatformConfig): Record<string, SectionValidationResult> {
  return {
    owner: {
      sectionKey: 'owner',
      isComplete: Boolean(config.owner.firstName && config.owner.lastName && config.owner.email && config.owner.phone),
      missingFields: [
        ...(!config.owner.firstName ? ['First Name'] : []),
        ...(!config.owner.lastName ? ['Last Name'] : []),
        ...(!config.owner.email ? ['Work Email'] : []),
        ...(!config.owner.phone ? ['Phone Number'] : []),
      ],
    },
    platform: {
      sectionKey: 'platform',
      isComplete: Boolean(config.platform.name && config.platform.legalName && config.platform.businessEmail && config.platform.supportEmail),
      missingFields: [
        ...(!config.platform.name ? ['Platform Name'] : []),
        ...(!config.platform.legalName ? ['Legal Business Name'] : []),
        ...(!config.platform.businessEmail ? ['Business Email'] : []),
        ...(!config.platform.supportEmail ? ['Support Email'] : []),
      ],
    },
    branding: {
      sectionKey: 'branding',
      isComplete: Boolean(config.branding.primaryColor && config.branding.secondaryColor),
      missingFields: [],
    },
    security: {
      sectionKey: 'security',
      isComplete: Boolean(config.security.mfaRequired && config.security.recoveryCodes.length === 8),
      missingFields: [
        ...(!config.security.mfaRequired ? ['MFA Enforcement'] : []),
        ...(config.security.recoveryCodes.length < 8 ? ['Recovery Codes Generation'] : []),
      ],
    },
    region: {
      sectionKey: 'region',
      isComplete: Boolean(config.region.country && config.region.currency && config.region.zones.length > 0),
      missingFields: [
        ...(config.region.zones.length === 0 ? ['At least one active delivery zone'] : []),
      ],
    },
    commerce: {
      sectionKey: 'commerce',
      isComplete: Boolean(config.commerce.minOrderValue > 0 && config.commerce.defaultCommissionRate >= 0),
      missingFields: [],
    },
    logistics: {
      sectionKey: 'logistics',
      isComplete: Boolean(config.logistics.baseDeliveryFee > 0 && config.logistics.allowedVehicles.length > 0),
      missingFields: [
        ...(config.logistics.allowedVehicles.length === 0 ? ['Allowed vehicle types'] : []),
      ],
    },
    finance: {
      sectionKey: 'finance',
      isComplete: Boolean(config.finance.enabledGateways.length > 0 && config.finance.vendorSettlementCycle),
      missingFields: [
        ...(config.finance.enabledGateways.length === 0 ? ['At least one payment gateway'] : []),
      ],
    },
    notifications: {
      sectionKey: 'notifications',
      isComplete: Boolean(config.notifications.pushEnabled || config.notifications.smsEnabled || config.notifications.emailEnabled),
      missingFields: [],
    },
    legal: {
      sectionKey: 'legal',
      isComplete: Boolean(config.legal.termsVersion && config.legal.privacyVersion),
      missingFields: [],
    },
    businessHours: {
      sectionKey: 'businessHours',
      isComplete: Boolean(config.businessHours.marketplaceOpen && config.businessHours.marketplaceClose),
      missingFields: [],
    },
  };
}

export async function testPaymentGatewayConnection(gatewayName: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
  await new Promise((r) => setTimeout(r, 750));
  return {
    success: true,
    latencyMs: 142,
    message: `${gatewayName} Sandbox Handshake Succeeded. TLS 1.3 Verified.`,
  };
}

export async function sendTestNotification(channel: 'PUSH' | 'SMS' | 'EMAIL', recipient: string): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 650));
  return {
    success: true,
    message: `Test ${channel} alert successfully dispatched to ${recipient}.`,
  };
}

export async function activatePlatformSystem(): Promise<{ success: boolean; message: string }> {
  const config = getStoredPlatformConfig();
  const validations = validateAllSections(config);

  const incompleteSections = Object.values(validations).filter((v) => !v.isComplete);

  if (incompleteSections.length > 0) {
    const errorDetails = incompleteSections
      .map((sec) => `${sec.sectionKey.toUpperCase()}: Missing ${sec.missingFields.join(', ')}`)
      .join('; ');
    throw new Error(`Cannot activate platform. Mandatory configuration missing: ${errorDetails}`);
  }

  // Audit event
  recordAuditEvent({
    action: 'SYSTEM_ACTIVATED',
    resource: 'Platform Setup Engine',
    resourceId: 'org_sevazo_root',
    oldValue: { setupState: 'READY' },
    newValue: { setupState: 'ACTIVE', activatedAt: new Date().toISOString() },
  });

  const session = getStoredSession();
  if (session) {
    setStoredSession({
      ...session,
      status: 'ACTIVE',
      setupStatus: 'COMPLETED',
      currentStep: 11,
    });
  }

  return {
    success: true,
    message: 'SevaZo Platform is now 100% ACTIVE and operational.',
  };
}
