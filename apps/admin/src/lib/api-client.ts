import { createAdminApiClient } from '@sevazo/api-client';

export const adminApiClient = createAdminApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sevazo_admin_token');
    }
    return null;
  },
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sevazo_admin_session');
      localStorage.removeItem('sevazo_admin_token');
      window.location.href = '/login';
    }
  },
});
