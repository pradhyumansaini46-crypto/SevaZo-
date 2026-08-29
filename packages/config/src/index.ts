export const APP_CONFIG = {
  appName: 'Sevazo',
  apiPrefix: 'api/v1',
  defaultPageSize: 20,
  maxPageSize: 100,
  currency: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
  },
  auth: {
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
  },
  cors: {
    allowedOrigins: [
      'http://localhost:3000', // Admin Next.js Web
      'http://localhost:4000', // Backend NestJS
      'http://localhost:8081', // Expo Web
    ],
  },
} as const;

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  OPERATIONS_MANAGER: 'OPERATIONS_MANAGER',
  CATALOG_MANAGER: 'CATALOG_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  LOGISTICS_MANAGER: 'LOGISTICS_MANAGER',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
} as const;

export type AdminRoleName = keyof typeof ADMIN_ROLES;
