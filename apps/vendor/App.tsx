import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store';
import { ErrorBoundary, OfflineBanner, ToastContainer } from './src/components';

function AppContent() {
  const { themeMode } = useThemeStore();

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
