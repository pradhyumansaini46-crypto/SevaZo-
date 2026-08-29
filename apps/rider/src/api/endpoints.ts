/**
 * API Endpoints Constants for Sevazo Rider App
 */

export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/rider/auth/send-otp',
    REGISTER: '/rider/auth/register',
    VERIFY_OTP: '/rider/auth/verify-otp',
    SESSION_CHECK: '/rider/auth/session-check',
    REFRESH_TOKEN: '/rider/auth/refresh-token',
    LOGOUT: '/rider/auth/logout',
    ME: '/rider/auth/me',
  },
  ONBOARDING: {
    STATE: '/rider/onboarding/state',
    STATUS: '/rider/onboarding/status',
    SAVE_STEP: '/rider/onboarding/save-step',
    VEHICLE: '/rider/onboarding/vehicle',
    SUBMIT: '/rider/onboarding/submit',
    RESUBMIT: '/rider/onboarding/resubmit',
  },
  PROFILE: {
    GET: '/rider/profile',
    UPDATE: '/rider/profile',
    STATUS: '/rider/profile/status',
  },
  ADDRESS: {
    GET: '/rider/address',
    SAVE: '/rider/address',
  },
  VEHICLE: {
    LIST: '/rider/vehicle',
    REGISTER: '/rider/vehicle',
    GET_BY_ID: (id: string) => `/rider/vehicle/${id}`,
    UPDATE: (id: string) => `/rider/vehicle/${id}`,
    SET_PRIMARY: (id: string) => `/rider/vehicle/${id}/primary`,
  },
  DOCUMENTS: {
    LIST: '/rider/documents',
    STATUS: '/rider/documents/status',
    UPLOAD_URL: '/rider/documents/upload-url',
    COMPLETE: '/rider/documents/complete',
    REPLACE: '/rider/documents/replace',
    GET_BY_ID: (id: string) => `/rider/documents/${id}`,
  },
  BANKING: {
    GET: '/rider/banking',
    SAVE: '/rider/banking',
    CHANGE_REQUEST: '/rider/banking/change-request',
    CHANGE: '/rider/banking',
    AUDIT: '/rider/banking/audit',
  },
  SERVICE_AREA: {
    GET: '/rider/service-area',
    SAVE: '/rider/service-area',
  },
  PREFERENCES: {
    GET: '/rider/preferences',
    SAVE: '/rider/preferences',
  },
  AVAILABILITY: {
    GET: '/rider/availability',
    TOGGLE: '/rider/availability/toggle',
    HEARTBEAT: '/rider/availability/heartbeat',
  },
  DELIVERIES: {
    ACTIVE: '/rider/deliveries/active',
    OFFERS: '/rider/deliveries/offers',
    ACCEPT: (id: string) => `/rider/deliveries/${id}/accept`,
    REJECT: (id: string) => `/rider/deliveries/${id}/reject`,
    UPDATE_STATUS: (id: string) => `/rider/deliveries/${id}/status`,
    VERIFY_OTP: (id: string) => `/rider/deliveries/${id}/verify-otp`,
  },
  EARNINGS: {
    SUMMARY: '/rider/earnings/summary',
    HISTORY: '/rider/earnings/history',
    PAYOUT_REQUEST: '/rider/earnings/payout-request',
  },
};
