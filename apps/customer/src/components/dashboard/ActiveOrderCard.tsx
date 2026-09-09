import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Order } from '../../types';
import { Bike, CheckCircle2, ChevronRight, Clock, ShieldCheck } from 'lucide-react-native';
import { triggerHaptic } from '../../utils/haptics';

interface ActiveOrderCardProps {
  order: Order;
  onPressTrack: (orderId: string) => void;
}

export const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({ order, onPressTrack }) => {
  // Compute active step (1 to 4)
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
        return 2;
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 2;
    }
  };

  const currentStep = getStepIndex(order.status);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Order placed & confirmed';
      case 'PREPARING':
        return 'Packing your fresh order';
      case 'READY_FOR_PICKUP':
        return 'Ready for rider pickup';
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        return 'Rider is on the way to you';
      case 'DELIVERED':
        return 'Order delivered';
      default:
        return 'Order in progress';
    }
  };

  const steps = [
    { label: 'Confirm' },
    { label: 'Packing' },
    { label: 'Rider' },
    { label: 'You' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Priority Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <View style={styles.bikeCircle}>
              <Bike size={16} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.tagText}>YOUR ORDER IS ACTIVE</Text>
              <Text style={styles.storeNameText}>{order.store?.businessName || 'FreshMart'}</Text>
            </View>
          </View>

          {order.deliveryOtp ? (
            <View style={styles.otpPill}>
              <ShieldCheck size={11} color="#059669" />
              <Text style={styles.otpLabel}>OTP </Text>
              <Text style={styles.otpValue}>{order.deliveryOtp}</Text>
            </View>
          ) : null}
        </View>

        {/* Status Subtitle */}
        <Text style={styles.statusDescription}>{getStatusText(order.status)}</Text>

        {/* 4-Step Visual Stepper Bar */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepsLineBackground} />
          <View
            style={[
              styles.stepsLineActive,
              { width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` },
            ]}
          />

          <View style={styles.stepsDotsRow}>
            {steps.map((step, idx) => {
              const stepNumber = idx + 1;
              const isDone = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              return (
                <View key={idx} style={styles.stepItemCol}>
                  <View
                    style={[
                      styles.stepDot,
                      isDone && styles.stepDotDone,
                      isCurrent && styles.stepDotCurrent,
                    ]}
                  >
                    {isDone ? (
                      <CheckCircle2 size={12} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <View style={[styles.innerDot, isCurrent && styles.innerDotCurrent]} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      (isDone || isCurrent) && styles.stepLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ETA & Track Action Button Row */}
        <View style={styles.footerRow}>
          <View style={styles.etaCol}>
            <View style={styles.etaRow}>
              <Clock size={13} color="#059669" style={{ marginRight: 4 }} />
              <Text style={styles.etaTitle}>Estimated arrival</Text>
            </View>
            <Text style={styles.etaValue}>
              {order.estimatedDeliveryTime || '12–18 minutes'}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              triggerHaptic('medium');
              onPressTrack(order.id);
            }}
            style={styles.trackBtn}
          >
            <Text style={styles.trackBtnText}>Track Order</Text>
            <ChevronRight size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bikeCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  tagText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  storeNameText: {
    ...Typography.titleSmall,
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  otpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  otpLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginLeft: 3,
    fontWeight: '600',
  },
  otpValue: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '900',
    color: '#047857',
    letterSpacing: 1,
  },
  statusDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: Spacing.md,
  },
  stepperContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  stepsLineBackground: {
    position: 'absolute',
    top: 9,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  stepsLineActive: {
    position: 'absolute',
    top: 9,
    left: 20,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepsDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItemCol: {
    alignItems: 'center',
    width: 50,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDotCurrent: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.primary,
    borderWidth: 2.5,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  innerDotCurrent: {
    backgroundColor: Colors.primary,
  },
  stepLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Spacing.sm,
  },
  etaCol: {},
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaTitle: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  etaValue: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '900',
    color: '#047857',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  trackBtnText: {
    ...Typography.bodySmall,
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 4,
  },
});
