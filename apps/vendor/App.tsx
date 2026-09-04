import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store';
import { ErrorBoundary, OfflineBanner, ToastContainer } from './src/components';

function AppContent() {
  const { themeMode } = useThemeStore();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      if (!document.getElementById('outfit-google-font')) {
        const link = document.createElement('link');
        link.id = 'outfit-google-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap';
        document.head.appendChild(link);
      }
      const styleId = 'outfit-default-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          * {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }
          input, textarea, select, button {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style={themeMode === 'DARK' ? 'light' : 'dark'} />
      <OfflineBanner />
      <RootNavigator />
      <ToastContainer />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
