import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import {
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  CreditCard,
  Banknote,
  Wallet,
  CheckCircle2,
  Lock,
  Percent,
  Zap,
} from 'lucide-react-native';
import { useCartStore } from '../../stores/cartStore';
import { useLocationStore } from '../../stores/locationStore';
import { useOrderStore } from '../../stores/orderStore';
import { PaymentMethodType } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CheckoutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { currentAddress } = useLocationStore();
  const { items, appliedCoupon, getCalculation, clearCart, deliveryInstruction } = useCartStore();
  const { placeOrder, isLoading } = useOrderStore();

  const calculation = getCalculation();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('UPI');

  const handlePlaceOrder = async () => {
    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          productImage: i.image,
          variantName: i.variantName,
          unitPrice: i.price,
          quantity: i.quantity,
          totalPrice: i.price * i.quantity,
        })),
        address: currentAddress,
        paymentMethod: selectedPayment,
        subtotal: calculation.itemsTotal,
        deliveryFee: calculation.deliveryFee,
        tax: calculation.taxAmount,
        discount: calculation.couponDiscount,
        totalAmount: calculation.grandTotal,
        instruction: deliveryInstruction,
      };

      if (selectedPayment === 'UPI' || selectedPayment === 'CARD') {
        navigation.navigate('Payment', { orderPayload });
      } else {
        const order = await placeOrder(orderPayload);
        clearCart();
        navigation.replace('OrderConfirmation', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          estimatedTime: '12-15 mins',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Checkout"
        subtitle="Review order & payment"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Delivery Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MapPin size={18} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.cardTitle}>Delivery Address</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AddressList')}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.addressLabel}>{currentAddress.label} Location</Text>
          <Text style={styles.addressText}>
            {currentAddress.line1}, {currentAddress.city} - {currentAddress.pincode}
          </Text>
          {currentAddress.landmark ? (
            <Text style={styles.landmarkText}>Landmark: {currentAddress.landmark}</Text>
          ) : null}

          <View style={styles.etaRow}>
            <Clock size={14} color={Colors.primary} />
            <Text style={styles.etaText}>Estimated Delivery: 10-15 Minutes</Text>
          </View>
        </View>

        {/* Order Items Preview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Order Summary ({items.length} items)</Text>
          </View>

          {items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text numberOfLines={1} style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Select Payment Mode</Text>
            <View style={styles.secureBadge}>
              <Lock size={12} color={Colors.success} />
              <Text style={styles.secureText}>100% SECURE</Text>
            </View>
          </View>

          {[
            {
              id: 'UPI' as PaymentMethodType,
              title: 'UPI (GPay / PhonePe / Paytm / CRED)',
              sub: 'Fast, instant zero-fee contactless payment',
              icon: <Zap size={18} color={Colors.primary} />,
              popular: true,
            },
            {
              id: 'WALLET' as PaymentMethodType,
              title: 'Sevazo Wallet (Balance: ₹450)',
              sub: 'Instant 1-click checkout with rewards',
              icon: <Wallet size={18} color={Colors.secondary} />,
              popular: false,
            },
            {
              id: 'CARD' as PaymentMethodType,
              title: 'Credit / Debit Cards',
              sub: 'Visa, MasterCard, RuPay, Amex',
              icon: <CreditCard size={18} color={Colors.accentOrange} />,
              popular: false,
            },
            {
              id: 'COD' as PaymentMethodType,
              title: 'Cash on Delivery (COD)',
              sub: 'Pay with cash or QR at your doorstep',
              icon: <Banknote size={18} color={Colors.textSecondary} />,
              popular: false,
            },
          ].map((pm) => {
            const isSelected = selectedPayment === pm.id;
            return (
              <TouchableOpacity
                key={pm.id}
                activeOpacity={0.85}
                onPress={() => setSelectedPayment(pm.id)}
                style={[
                  styles.paymentOption,
                  isSelected && styles.paymentOptionSelected,
                ]}
              >
                <View style={styles.paymentLeft}>
                  <View style={styles.paymentIconWrap}>{pm.icon}</View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.paymentTitle}>{pm.title}</Text>
                      {pm.popular ? (
                        <View style={styles.popBadge}>
                          <Text style={styles.popBadgeText}>POPULAR</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.paymentSub}>{pm.sub}</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{calculation.itemsTotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery & Handling</Text>
            <Text style={styles.billValue}>
              {calculation.deliveryFee === 0 ? 'FREE' : `₹${calculation.deliveryFee + calculation.handlingFee}`}
            </Text>
          </View>
          {calculation.couponDiscount > 0 ? (
            <View style={styles.billRow}>
              <Text style={styles.discountLabel}>Coupon Savings</Text>
              <Text style={styles.discountValue}>-₹{calculation.couponDiscount}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{calculation.grandTotal}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Floating Pay Button */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : Spacing.md,
          },
        ]}
      >
        <View style={styles.bottomPriceWrap}>
          <Text style={styles.bottomPayableLabel}>Payable Total</Text>
          <Text style={styles.bottomPayableValue}>₹{calculation.grandTotal}</Text>
        </View>

        <Button
          title={selectedPayment === 'COD' ? 'Place Order' : `Pay ₹${calculation.grandTotal}`}
          onPress={handlePlaceOrder}
          loading={isLoading}
          icon={<ShieldCheck size={18} color={Colors.textInverse} />}
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
  scrollContent: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  changeLink: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primary,
  },
  addressLabel: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addressText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  landmarkText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm + 2,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  etaText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginLeft: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  itemPrice: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  secureText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.success,
    marginLeft: 3,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 2,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  paymentTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  popBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    marginLeft: 6,
  },
  popBadgeText: {
    ...Typography.caption,
    fontSize: 8,
    fontWeight: '800',
    color: '#92400E',
  },
  paymentSub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
    fontSize: 11,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 2,
  },
  billLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  billValue: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  discountLabel: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.success,
  },
  discountValue: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  totalLabel: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  totalValue: {
    ...Typography.priceLarge,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.elevated,
  },
  bottomPriceWrap: {
    flex: 1,
  },
  bottomPayableLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  bottomPayableValue: {
    ...Typography.priceLarge,
    color: Colors.textPrice,
  },
  payBtn: {
    flex: 1.5,
  },
});
