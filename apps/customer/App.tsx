import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastContainer } from './src/components/common/Toast';
import { GlobalModal } from './src/components/common/Modal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        {Platform.OS === 'web' ? (
          <View style={styles.webOuterContainer}>
            <View style={styles.webMobileFrame}>
              <RootNavigator />
              <ToastContainer />
              <GlobalModal />
            </View>
          </View>
        ) : (
          <>
            <RootNavigator />
            <ToastContainer />
            <GlobalModal />
          </>
        )}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  webMobileFrame: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    maxHeight: 900,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    }),
  },
});
