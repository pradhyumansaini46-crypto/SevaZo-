'use client';

import { AdminActionType, AuditLogEntry } from '@/types/audit';
import { getStoredSession } from '@/lib/auth-store';

const AUDIT_STORAGE_KEY = 'sevazo_admin_audit_logs';

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function recordAuditEvent(params: {
  action: AdminActionType;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown> | string | null;
  newValue?: Record<string, unknown> | string | null;
  status?: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, unknown>;
}): AuditLogEntry {
  const session = getStoredSession();
  const entry: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    adminId: session?.id || 'adm_system',
    adminName: session ? `${session.firstName} ${session.lastName}` : 'System Admin',
    adminEmail: session?.email || 'system@sevazo.com',
    adminRole: session?.role || 'SUPER_ADMIN',
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    oldValue: params.oldValue,
    newValue: params.newValue,
    ipAddress: '192.168.1.7',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Sevazo-Admin-Client/1.0',
    requestId: generateRequestId(),
    timestamp: new Date().toISOString(),
    status: params.status || 'SUCCESS',
    metadata: params.metadata,
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = getStoredAuditLogs();
      const updated = [entry, ...existing].slice(0, 100); // keep latest 100
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }

  return entry;
}

export function getStoredAuditLogs(): AuditLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return getDefaultAuditLogs();
    return JSON.parse(raw);
  } catch {
    return getDefaultAuditLogs();
  }
}

function getDefaultAuditLogs(): AuditLogEntry[] {
  return [
    {
      id: 'aud_101',
      adminId: 'adm_super_01',
      adminName: 'Pradhyuman Saini',
      adminEmail: 'owner@sevazo.com',
      adminRole: 'SUPER_ADMIN',
      action: 'SYSTEM_ACTIVATED',
      resource: 'Platform Setup',
      resourceId: 'org_sevazo_01',
      oldValue: { setupState: 'READY' },
      newValue: { setupState: 'ACTIVE' },
      ipAddress: '192.168.1.7',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      requestId: 'req_k9f8z1_ab92c',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'SUCCESS',
    },
    {
      id: 'aud_102',
      adminId: 'adm_super_01',
      adminName: 'Pradhyuman Saini',
      adminEmail: 'owner@sevazo.com',
      adminRole: 'SUPER_ADMIN',
      action: 'SECURITY_MFA_RESET',
      resource: 'Admin Security',
      resourceId: 'adm_super_01',
      oldValue: { mfaEnabled: false },
      newValue: { mfaEnabled: true, method: 'TOTP' },
      ipAddress: '192.168.1.7',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      requestId: 'req_m8q2v7_x910p',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'SUCCESS',
    },
    {
      id: 'aud_103',
      adminId: 'adm_super_01',
      adminName: 'Pradhyuman Saini',
      adminEmail: 'owner@sevazo.com',
      adminRole: 'SUPER_ADMIN',
      action: 'COMMISSION_CHANGED',
      resource: 'Finance Commission Rule',
      resourceId: 'cat_food_01',
      oldValue: { rate: '10%' },
      newValue: { rate: '12%' },
      ipAddress: '192.168.1.7',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      requestId: 'req_p3t5h8_z771k',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: 'SUCCESS',
    },
  ];
}
