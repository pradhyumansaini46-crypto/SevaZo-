import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { KeyRound, QrCode, CheckCircle, Package, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useDeliveryStore } from '../store/deliveryStore';

export const PickupVerificationScreen = ({ navigation }: any) => {
  const { activeDelivery, updateDeliveryStatus } = useDeliveryStore();
  const [otp, setOtp] = useState(activeDelivery?.pickupOtp || '4821');

  const handleConfirmPickup = () => {
    updateDeliveryStatus('IN_TRANSIT');
    navigation.replace('CustomerDelivery', { deliveryId: activeDelivery?.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <ShieldCheck size={32} color="#22C55E" />
        </View>
        <Text style={styles.title}>Pickup Verification</Text>
        <Text style={styles.subtitle}>Ask the merchant for the 4-digit Pickup OTP or scan store package QR code.</Text>
      </View>

      {/* Verification Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>STORE VERIFICATION CODE</Text>
        <TextInput
          style={[styles.otpInput, { letterSpacing: 16 }]}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Text style={styles.hint}>Demo OTP: 4821</Text>
      </View>

      {/* Package Checklist Confirmation */}
      <View style={styles.checklistCard}>
        <Text style={styles.checklistTitle}>PACKAGE CHECKLIST</Text>
        {activeDelivery?.items.map((item) => (
          <View key={item.id} style={styles.checkItem}>
            <CheckCircle size={18} color="#22C55E" />
            <Text style={styles.itemText}>{item.quantity}x {item.name}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPickup}>
        <Text style={styles.confirmText}>CONFIRM PICKUP & START TRANSIT</Text>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22C55E',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  otpInput: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
  hint: {
    ...Typography.bodySmall,
    color: '#22C55E',
    marginTop: Spacing.sm,
  },
  checklistCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xxl,
  },
  checklistTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  itemText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  confirmText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default PickupVerificationScreen;
