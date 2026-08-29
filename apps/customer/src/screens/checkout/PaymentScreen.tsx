import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrderStore } from '../../stores/orderStore';
import { useCartStore } from '../../stores/cartStore';

export const PaymentScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const orderPayload = route.params?.orderPayload || {};

  const { placeOrder } = useOrderStore();
  const { clearCart } = useCartStore();

  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [processing, setProcessing] = useState(false);

  const handlePayNow = async () => {
    setProcessing(true);

    // Simulate 1.5s secure gateway communication
    setTimeout(async () => {
      try {
        const order = await placeOrder(orderPayload);
        clearCart();
        setProcessing(false);
        navigation.replace('OrderConfirmation', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          estimatedTime: '10-15 mins',
        });
      } catch {
        setProcessing(false);
      }
    }, 1500);
  };

  const amount = orderPayload.totalAmount || 275;

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Secure Payment Gateway"
        subtitle="Sevazo Pay 256-Bit Encrypted"
      />

      <View style={[styles.content, { paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.md : Spacing.lg }]}>
        {/* Amount Box */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{amount}</Text>
          <View style={styles.securityRow}>
            <Lock size={12} color={Colors.success} />
            <Text style={styles.securityText}>
              Verified by NPCI UPI Gateway & Razorpay
            </Text>
          </View>
        </View>

        {/* UPI Apps Grid */}
        <Text style={styles.sectionTitle}>Select UPI App to Pay</Text>
        <View style={styles.upiGrid}>
          {[
            { name: 'Google Pay', icon: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=100' },
            { name: 'PhonePe', icon: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100' },
            { name: 'Paytm UPI', icon: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100' },
            { name: 'CRED UPI', icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100' },
          ].map((app, idx) => {
            const isSelected = selectedUpiApp === app.name;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => setSelectedUpiApp(app.name)}
                style={[
                  styles.upiAppCard,
                  isSelected && styles.upiAppCardSelected,
                ]}
              >
                <View style={styles.appIconWrap}>
                  <Image source={{ uri: app.icon }} style={styles.appIcon} resizeMode="cover" />
                </View>
                <Text style={styles.appName}>{app.name}</Text>
                {isSelected ? (
                  <CheckCircle2 size={18} color={Colors.primary} style={styles.checkIcon} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Security Assurance */}
        <View style={styles.assuranceBox}>
          <ShieldCheck size={24} color={Colors.primary} style={{ marginRight: Spacing.md }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.assuranceTitle}>100% Refund Guarantee</Text>
            <Text style={styles.assuranceSub}>
              If your order is cancelled or not delivered on time, money is instantly credited back to your source account.
            </Text>
          </View>
        </View>

        <Button
          title={processing ? 'Authorizing Payment...' : `Authorize & Pay ₹${amount}`}
          onPress={handlePayNow}
          loading={processing}
          size="lg"
          style={styles.payBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    flex: 1,
    justifyContent: 'space-between',
  },
  amountCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  amountLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  amountValue: {
    ...Typography.hero,
    fontSize: 36,
    color: Colors.textPrice,
    fontWeight: '900',
    marginVertical: Spacing.xs,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  upiAppCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
    ...Shadows.small,
  },
  upiAppCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  appIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  appName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  assuranceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assuranceTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  assuranceSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  payBtn: {
    marginTop: Spacing.lg,
  },
});
