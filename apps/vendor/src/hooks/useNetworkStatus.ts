import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useNetworkStore } from '../stores/networkStore';

export const useNetworkStatus = () => {
  const { isOnline, setIsOnline } = useNetworkStore();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [setIsOnline]);

  return { isOnline };
};
