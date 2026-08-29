import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { KeyRound, Camera, QrCode, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useDeliveryStore } from '../store/deliveryStore';

export const DeliveryProofScreen = ({ navigation }: any) => {
  const { activeDelivery, updateDeliveryStatus } = useDeliveryStore();
  const [otp, setOtp] = useState(activeDelivery?.deliveryOtp || '7192');
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const handleCompleteDelivery = () => {
    updateDeliveryStatus('DELIVERED');
    navigation.replace('DeliveryComplete', {
      deliveryId: activeDelivery?.id,
      earnings: activeDelivery?.riderEarning || 68.5,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <ShieldCheck size={32} color="#22C55E" />
        </View>
        <Text style={styles.title}>Delivery Handover</Text>
        <Text style={styles.subtitle}>Enter the 4-digit Customer OTP or capture a doorstep package photo.</Text>
      </View>

      {/* Primary Verification: Customer OTP */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>CUSTOMER 4-DIGIT OTP</Text>
        <TextInput
          style={[styles.otpInput, { letterSpacing: 16 }]}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Text style={styles.hint}>Demo OTP: 7192</Text>
      </View>

      {/* Alternative Verification: Photo Proof */}
      <TouchableOpacity
        style={[styles.photoBox, photoUploaded && styles.photoUploadedBox]}
        onPress={() => setPhotoUploaded(!photoUploaded)}
      >
        <Camera size={24} color={photoUploaded ? '#22C55E' : '#38BDF8'} />
        <Text style={styles.photoText}>
          {photoUploaded ? 'Doorstep Photo Attached ✅' : 'Take Doorstep Photo (Optional / Fallback)'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.completeButton} onPress={handleCompleteDelivery}>
        <Text style={styles.completeText}>COMPLETE DELIVERY & CLAIM EARNINGS</Text>
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
  photoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xxl,
  },
  photoUploadedBox: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  photoText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  completeText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default DeliveryProofScreen;
