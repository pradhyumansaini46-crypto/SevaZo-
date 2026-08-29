import { Platform } from 'react-native';

export const checkIsOnline = async (): Promise<boolean> => {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
};
