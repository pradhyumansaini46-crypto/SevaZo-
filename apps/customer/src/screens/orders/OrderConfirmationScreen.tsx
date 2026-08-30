import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import { CheckCircle2, Zap, MapPin, ArrowRight } from 'lucide-react-native';

export const OrderConfirmationScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId || 'ord-1001';
  const orderNumber = route.params?.orderNumber || 'SVZ-20260821-7892';
  const estimatedTime = route.params?.estimatedTime || '10-15 mins';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Success Badge */}
        <View style={styles.iconCircle}>
          <CheckCircle2 size={64} color={Colors.primary} strokeWidth={2.5} />
        </View>

        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.orderNumberText}>Order ID: {orderNumber}</Text>

        {/* ETA Highlight Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaHeaderRow}>
            <Zap size={20} color="#D97706" fill="#D97706" />
            <Text style={styles.etaTitle}>SevaZo Flash Delivery</Text>
          </View>
          <Text style={styles.etaTime}>Arriving in {estimatedTime}</Text>
          <Text style={styles.etaSub}>
            Your order has reached the dark store and packing is in progress.
          </Text>
        </View>

        {/* Progress summary steps */}
        <View style={styles.stepsCard}>
          <View style={styles.stepItem}>
            <View style={styles.stepDotActive} />
            <Text style={styles.stepText}>Order Confirmed & Payment Verified</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepDotActive} />
            <Text style={styles.stepText}>Rider Assigned (Santosh Rawat)</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepDotPending} />
            <Text style={styles.stepTextPending}>Doorstep Handover with OTP</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Track Live Order"
          onPress={() => navigation.replace('LiveTracking', { orderId })}
          icon={<ArrowRight size={18} color={Colors.textInverse} />}
          iconPosition="right"
          size="lg"
          style={styles.trackBtn}
        />

        <Button
          title="Back to Home"
          onPress={() => navigation.replace('Main')}
          variant="ghost"
          size="md"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    paddingTop: Spacing.xxl + 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.elevated,
  },
  title: {
    ...Typography.hero,
    fontSize: 24,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  orderNumberText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
  },
  etaCard: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: Spacing.lg,
  },
  etaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  etaTitle: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 6,
  },
  etaTime: {
    ...Typography.hero,
    fontSize: 28,
    color: '#92400E',
    fontWeight: '900',
    marginVertical: 4,
  },
  etaSub: {
    ...Typography.bodySmall,
    color: '#78350F',
    textAlign: 'center',
    marginTop: 2,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  stepDotActive: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    marginRight: Spacing.md,
  },
  stepDotPending: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
    marginRight: Spacing.md,
  },
  stepText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stepTextPending: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
  },
  footer: {
    paddingBottom: Spacing.lg,
  },
  trackBtn: {
    marginBottom: Spacing.sm,
  },
});
