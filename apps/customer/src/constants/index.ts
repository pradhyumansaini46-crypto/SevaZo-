export const APP_CONFIG = {
  appName: 'Sevazo Customer',
  version: '1.0.0',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  deliveryTimeMinutes: '10-15',
  supportPhone: '+91 80000 12345',
  supportEmail: 'support@sevazo.in',
  defaultCurrency: 'INR',
  currencySymbol: '₹',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sevazo_customer_auth_token',
  REFRESH_TOKEN: 'sevazo_customer_refresh_token',
  USER_DATA: 'sevazo_customer_user_data',
  ONBOARDING_DRAFT: 'sevazo_customer_onboarding_draft',
  SAVED_LOCATION: 'sevazo_customer_saved_location',
};

export const ONBOARDING_STEPS = {
  ACCOUNT: { id: 'ACCOUNT', index: 1, title: 'Account Creation', path: 'Register' },
  PROFILE: { id: 'PROFILE', index: 2, title: 'Basic Profile', path: 'RegisterProfile' },
  LOCATION: { id: 'LOCATION', index: 3, title: 'Delivery Location', path: 'RegisterLocation' },
  ADDRESS: { id: 'ADDRESS', index: 4, title: 'Delivery Address', path: 'RegisterAddress' },
  PREFERENCES: { id: 'PREFERENCES', index: 5, title: 'Shopping Preferences', path: 'RegisterPreferences' },
  CONSENT: { id: 'CONSENT', index: 6, title: 'Terms & Consent', path: 'RegisterTerms' },
};
