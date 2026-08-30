import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

/**
 * Hook to monitor network connectivity
 */
export const useNetwork = (): NetworkState => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handleOnline = () => setNetworkState({ isConnected: true, isInternetReachable: true });
      const handleOffline = () => setNetworkState({ isConnected: false, isInternetReachable: false });

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        if (typeof window.removeEventListener === 'function') {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        }
      };
    }
  }, []);

  return networkState;
};

export default useNetwork;
