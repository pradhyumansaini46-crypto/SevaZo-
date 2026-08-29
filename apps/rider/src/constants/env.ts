import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Dynamically resolves the API base URL.
 * Automatically detects the host machine's IP when running in Expo Go on physical devices.
 */
const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:4000/api/v1`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }

  // Local Wi-Fi IP of host machine for physical iOS / Android devices
  return 'http://192.168.1.7:4000/api/v1';
};

const getWsUrl = (): string => {
  if (process.env.EXPO_PUBLIC_WS_URL) {
    return process.env.EXPO_PUBLIC_WS_URL;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `ws://${host}:4000`;
    }
  }

  return 'ws://192.168.1.7:4000';
};

export const ENV = {
  API_BASE_URL: getApiBaseUrl(),
  WS_URL: getWsUrl(),
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',
  IS_DEV: process.env.NODE_ENV !== 'production',
  DEFAULT_TIMEOUT_MS: 15000,
  OTP_RESEND_SECONDS: 30,
  TOKEN_STORAGE_KEY: '@sevazo_rider_access_token',
  REFRESH_TOKEN_STORAGE_KEY: '@sevazo_rider_refresh_token',
  USER_STORAGE_KEY: '@sevazo_rider_user',
};

export default ENV;
