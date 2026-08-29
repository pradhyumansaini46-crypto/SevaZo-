import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '../stores/toastStore';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { toasts, hideToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        {
          top: Math.max(insets.top, 16) + 8,
        },
      ]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={hideToast} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
});
