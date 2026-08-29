'use client';

import * as React from 'react';
import { getStoredSession, AdminRole } from '@/lib/auth-store';
import { ROLE_PERMISSIONS } from '@/types/auth';

export function usePermissions() {
  const [role, setRole] = React.useState<AdminRole>('SUPER_ADMIN');
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setRole(session.role);
    }
    setIsLoaded(true);
  }, []);

  const isSuperAdmin = role === 'SUPER_ADMIN';

  const hasPermission = React.useCallback(
    (permissionCode: string): boolean => {
      if (role === 'SUPER_ADMIN') return true;

      const granted = ROLE_PERMISSIONS[role] || [];
      if (granted.includes('*')) return true;
      if (granted.includes(permissionCode)) return true;

      // Handle wildcard prefixes like "catalog.*"
      const [category] = permissionCode.split('.');
      if (granted.includes(`${category}.*`)) return true;

      return false;
    },
    [role]
  );

  return {
    isLoaded,
    role,
    isSuperAdmin,
    hasPermission,
    canManageAdmins: isSuperAdmin,
    canManageFinance: isSuperAdmin || role === 'FINANCE_MANAGER',
    canManageLogistics: isSuperAdmin || role === 'LOGISTICS_MANAGER' || role === 'OPERATIONS_MANAGER',
    canManageCatalog: isSuperAdmin || role === 'CATALOG_MANAGER',
    canManageSupport: isSuperAdmin || role === 'SUPPORT_AGENT' || role === 'OPERATIONS_MANAGER',
  };
}
