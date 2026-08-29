import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetwork } from '../hooks/useNetwork';
import { Typography, Spacing } from '../theme';

export const NetworkStatus: React.FC = () => {
  const { isConnected } = useNetwork();

  if (isConnected) return null;

  return (
    <View style={styles.banner} accessible={true} accessibilityRole="alert">
      <WifiOff size={16} color="#FFFFFF" />
      <Text style={styles.bannerText}>No Internet Connection. Retrying...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#EF4444',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  bannerText: {
    ...Typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default NetworkStatus;
