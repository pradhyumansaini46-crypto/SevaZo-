export const APP_CONFIG = {
  APP_NAME: 'Sevazo Vendor',
  VERSION: '1.0.0',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  TIMEOUT_MS: 15000,
  DEFAULT_SLA_HOURS: '24-48 Hours',
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  SUPPORTED_DOCUMENT_MIMES: ['application/pdf', 'image/jpeg', 'image/png'],
  DEFAULT_COMMISSION_RATE: 10.0, // 10%
  DEMO_OTP: '123456',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sevazo_vendor_access_token',
  REFRESH_TOKEN: 'sevazo_vendor_refresh_token',
  VENDOR_USER: 'sevazo_vendor_user_profile',
  THEME_MODE: 'sevazo_vendor_theme_mode',
  STORE_STATUS: 'sevazo_vendor_store_status',
  ALERT_SOUND: 'sevazo_vendor_alert_sound',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};
