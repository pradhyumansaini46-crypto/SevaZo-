import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Zap, ArrowRight, Wallet, Star } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useDeliveryStore } from '../store/deliveryStore';

export const DeliveryCompleteScreen = ({ navigation, route }: any) => {
  const { setActiveDelivery } = useDeliveryStore();
  const earnings = route?.params?.earnings || 68.5;

  const handleReturnHome = () => {
    setActiveDelivery(null);
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <View style={styles.successIconCircle}>
        <CheckCircle size={56} color="#22C55E" />
      </View>

      <Text style={styles.title}>Delivery Complete!</Text>
      <Text style={styles.subtitle}>Order handover verified & customer notified successfully.</Text>

      {/* Payout Breakdown Card */}
      <View style={styles.payoutCard}>
        <Text style={styles.cardHeader}>TRIP EARNINGS CREDITED</Text>
        <Text style={styles.payoutAmount}>₹{earnings.toFixed(2)}</Text>

        <View style={styles.breakdownList}>
          <View style={styles.breakdownRow}>
            <Text style={styles.rowLabel}>Base Delivery Pay</Text>
            <Text style={styles.rowVal}>₹35.00</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.rowLabel}>Distance Pay (3.8 km)</Text>
            <Text style={styles.rowVal}>₹19.50</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.rowLabel}>Surge Multiplier (1.2x)</Text>
            <Text style={styles.rowVal}>₹14.00</Text>
          </View>
          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Added to Wallet Balance</Text>
            <Text style={styles.totalVal}>+₹{earnings.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={handleReturnHome}>
        <Text style={styles.homeText}>RETURN TO DASHBOARD</Text>
        <ArrowRight size={20} color="#0F172A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#052E16',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22C55E',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.hero,
    color: Colors.textPrimary,
    fontSize: 28,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  payoutCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  cardHeader: {
    ...Typography.caption,
    color: '#22C55E',
    fontWeight: '800',
  },
  payoutAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#22C55E',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  breakdownList: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  rowVal: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  totalLabel: {
    ...Typography.bodyMedium,
    color: '#38BDF8',
    fontWeight: '700',
  },
  totalVal: {
    ...Typography.bodyMedium,
    color: '#22C55E',
    fontWeight: '800',
  },
  homeButton: {
    width: '100%',
    backgroundColor: '#38BDF8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  homeText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#0F172A',
  },
});
