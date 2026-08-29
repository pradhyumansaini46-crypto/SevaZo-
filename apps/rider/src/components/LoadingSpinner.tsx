import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#38BDF8',
  message,
}) => {
  return (
    <View style={styles.spinnerContainer} accessible={true} accessibilityRole="progressbar">
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.messageText}>{message}</Text>}
    </View>
  );
};

export interface ScreenLoaderProps {
  visible: boolean;
  message?: string;
}

export const ScreenLoader: React.FC<ScreenLoaderProps> = ({
  visible,
  message = 'Loading...',
}) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#38BDF8" />
          {message && <Text style={styles.cardMessage}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loaderCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 180,
  },
  cardMessage: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoadingSpinner;
