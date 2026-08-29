export const SEVAZO_THEME = {
  colors: {
    primary: {
      DEFAULT: '#0F172A',
      foreground: '#F8FAFC',
      50: '#F8FAFC',
      100: '#F1F5F9',
      500: '#64748B',
      900: '#0F172A',
    },
    brand: {
      emerald: '#10B981',
      indigo: '#6366F1',
      amber: '#F59E0B',
      rose: '#F43F5E',
      cyan: '#06B6D4',
    },
    status: {
      success: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
      warning: { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' },
      error: { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
      info: { bg: '#E0F2FE', text: '#0369A1', border: '#7DD3FC' },
      neutral: { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
    },
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
} as const;

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  const upper = status.toUpperCase();
  if (['ACTIVE', 'APPROVED', 'DELIVERED', 'PAID', 'COMPLETED', 'CONFIRMED'].includes(upper)) {
    return SEVAZO_THEME.colors.status.success;
  }
  if (['PENDING', 'UNDER_REVIEW', 'PREPARING', 'PROCESSING', 'READY_FOR_PICKUP'].includes(upper)) {
    return SEVAZO_THEME.colors.status.warning;
  }
  if (['REJECTED', 'CANCELLED', 'FAILED', 'BLOCKED', 'SUSPENDED'].includes(upper)) {
    return SEVAZO_THEME.colors.status.error;
  }
  if (['IN_TRANSIT', 'PICKED_UP', 'ASSIGNED'].includes(upper)) {
    return SEVAZO_THEME.colors.status.info;
  }
  return SEVAZO_THEME.colors.status.neutral;
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
