import React from 'react';
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
import { CartItemRow } from '../../components/CartItemRow';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import {
  ShoppingBag,
  Zap,
  Tag,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Trash2,
  BellRing,
  DoorClosed,
} from 'lucide-react-native';
import { useCartStore } from '../../stores/cartStore';
import { useLocationStore } from '../../stores/locationStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CartScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { currentAddress } = useLocationStore();
  const {
    items,
    appliedCoupon,
    removeCoupon,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    getCalculation,
    deliveryInstruction,
    setDeliveryInstruction,
  } = useCartStore();

  const calculation = getCalculation();

  const freeDeliveryThreshold = 199;
  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - calculation.itemsTotal);
  const freeDeliveryProgress = Math.min(1, calculation.itemsTotal / freeDeliveryThreshold);

  return (
    <View style={styles.container}>
      <Header
        title="My Shopping Cart"
        subtitle={`${items.length} unique items`}
        rightAction={
          items.length > 0 ? (
            <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
              <Trash2 size={18} color={Colors.danger} />
            </TouchableOpacity>
          ) : null
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={36} color={Colors.primary} />}
          title="Your Cart is Empty"
          description="Looks like you haven't added any fresh groceries, milk, or snacks to your cart yet."
          actionTitle="Start Shopping"
          onAction={() => navigation.navigate('HomeTab')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Fast Delivery Arrival Banner */}
          <View style={styles.deliveryBanner}>
            <View style={styles.deliveryBannerLeft}>
              <View style={styles.zapIconWrap}>
                <Zap size={16} color={Colors.primary} fill={Colors.primary} />
              </View>
              <View>
                <Text style={styles.deliveryBannerTitle}>Delivery in 10-15 Minutes</Text>
                <Text style={styles.deliveryBannerSub}>
                  Shipment from SevaZo Express Dark Store
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Address Pill */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddressList')}
            style={styles.addressPill}
          >
            <MapPin size={18} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
            <View style={styles.addressTextWrap}>
              <Text style={styles.addressLabel}>Deliver to {currentAddress.label}</Text>
              <Text numberOfLines={1} style={styles.addressValue}>
                {currentAddress.line1}, {currentAddress.city}
              </Text>
            </View>
            <Text style={styles.changeAddressText}>Change</Text>
          </TouchableOpacity>

          {/* Free Delivery Threshold Bar */}
          <View style={styles.freeDeliveryBox}>
            <View style={styles.freeDeliveryTextRow}>
              {freeDeliveryRemaining > 0 ? (
                <Text style={styles.freeDeliveryText}>
                  Add items worth <Text style={{ fontWeight: '800' }}>₹{freeDeliveryRemaining}</Text> more for FREE delivery
                </Text>
              ) : (
                <Text style={styles.freeDeliverySuccess}>
                  🎉 You unlocked FREE Delivery!
                </Text>
              )}
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${freeDeliveryProgress * 100}%` as any },
                ]}
              />
            </View>
          </View>

          {/* Cart Item Rows */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionHeading}>Items in Cart</Text>
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrement={() => incrementItem(item.id)}
                onDecrement={() => decrementItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </View>

          {/* Coupons & Offers Banner */}
          <View style={styles.couponSection}>
            {appliedCoupon ? (
              <View style={styles.appliedCouponCard}>
                <View style={styles.couponLeft}>
                  <CheckCircle2 size={20} color={Colors.success} style={{ marginRight: Spacing.sm }} />
                  <View>
                    <Text style={styles.appliedCode}>{appliedCoupon.code} Applied</Text>
                    <Text style={styles.appliedSavings}>
                      You saved ₹{calculation.couponDiscount} on this order
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={removeCoupon}>
                  <Text style={styles.removeCouponText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('CouponList')}
                style={styles.applyCouponBtn}
              >
                <View style={styles.couponBtnLeft}>
                  <Percent size={18} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
                  <Text style={styles.applyCouponText}>Apply Coupon / Promo Code</Text>
                </View>
                <ChevronRight size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Delivery Instructions Options */}
          <View style={styles.instructionsSection}>
            <Text style={styles.sectionHeading}>Delivery Instructions</Text>
            <View style={styles.instructionPillsRow}>
              {[
                { title: 'Leave at doorstep', icon: <DoorClosed size={14} color={Colors.textSecondary} /> },
                { title: 'Ring bell once', icon: <BellRing size={14} color={Colors.textSecondary} /> },
                { title: 'Do not disturb', icon: <ShieldCheck size={14} color={Colors.textSecondary} /> },
              ].map((inst, idx) => {
                const isSelected = deliveryInstruction === inst.title;
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => setDeliveryInstruction(inst.title)}
                    style={[
                      styles.instructionPill,
                      isSelected && styles.instructionPillSelected,
                    ]}
                  >
                    {inst.icon}
                    <Text
                      style={[
                        styles.instructionText,
                        isSelected && styles.instructionTextSelected,
                      ]}
                    >
                      {inst.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bill Breakdown Card */}
          <View style={styles.billCard}>
            <Text style={styles.billHeading}>Bill Summary</Text>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Total (incl. GST)</Text>
              <Text style={styles.billValue}>₹{calculation.itemsTotal}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Handling Charge</Text>
              <Text style={styles.billValue}>₹{calculation.handlingFee}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              {calculation.deliveryFee === 0 ? (
                <Text style={styles.freeFeeText}>FREE</Text>
              ) : (
                <Text style={styles.billValue}>₹{calculation.deliveryFee}</Text>
              )}
            </View>

            {calculation.couponDiscount > 0 ? (
              <View style={styles.billRow}>
                <Text style={styles.discountLabel}>Coupon Savings</Text>
                <Text style={styles.discountValue}>-₹{calculation.couponDiscount}</Text>
              </View>
            ) : null}

            <View style={styles.divider} />

            <View style={styles.grandTotalRow}>
              <View>
                <Text style={styles.grandTotalLabel}>To Pay</Text>
                <Text style={styles.inclusiveText}>Inclusive of all taxes</Text>
              </View>
              <Text style={styles.grandTotalValue}>₹{calculation.grandTotal}</Text>
            </View>

            {calculation.savingsTotal > 0 ? (
              <View style={styles.savingsBanner}>
                <Text style={styles.savingsBannerText}>
                  🎉 Yay! You saved a total of ₹{calculation.savingsTotal} on this order
                </Text>
              </View>
            ) : null}
          </View>

          {/* Bottom spacer for sticky bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Sticky Bottom Bar */}
      {items.length > 0 ? (
        <View
          style={[
            styles.stickyBottomBar,
            {
              paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : Spacing.md,
            },
          ]}
        >
          <View style={styles.bottomPriceWrap}>
            <Text style={styles.bottomTotalLabel}>Total Amount</Text>
            <Text style={styles.bottomTotalValue}>₹{calculation.grandTotal}</Text>
          </View>

          <Button
            title="Proceed to Checkout"
            onPress={() => navigation.navigate('Checkout')}
            icon={<ChevronRight size={18} color={Colors.textInverse} />}
            iconPosition="right"
            size="lg"
            style={styles.checkoutBtn}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  clearBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  deliveryBanner: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  deliveryBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zapIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
  },
  deliveryBannerTitle: {
    ...Typography.titleSmall,
    color: Colors.primaryDark,
  },
  deliveryBannerSub: {
    ...Typography.bodySmall,
    color: Colors.primary,
    marginTop: 2,
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  addressTextWrap: {
    flex: 1,
  },
  addressLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  addressValue: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  changeAddressText: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primary,
  },
  freeDeliveryBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  freeDeliveryTextRow: {
    marginBottom: Spacing.xs + 2,
  },
  freeDeliveryText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  freeDeliverySuccess: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.success,
  },
  progressBarBg: {
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  itemsSection: {
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  couponSection: {
    marginBottom: Spacing.md,
  },
  applyCouponBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
  couponBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applyCouponText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  appliedCouponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedCode: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.success,
  },
  appliedSavings: {
    ...Typography.bodySmall,
    color: '#065F46',
    fontSize: 11,
    marginTop: 2,
  },
  removeCouponText: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.danger,
  },
  instructionsSection: {
    marginBottom: Spacing.md,
  },
  instructionPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  instructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  instructionPillSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  instructionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  instructionTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  billCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  billHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
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
  freeFeeText: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.success,
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
  grandTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  grandTotalLabel: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
  },
  inclusiveText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  grandTotalValue: {
    ...Typography.priceLarge,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  savingsBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  savingsBannerText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  stickyBottomBar: {
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
  bottomTotalLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  bottomTotalValue: {
    ...Typography.priceLarge,
    color: Colors.textPrice,
  },
  checkoutBtn: {
    flex: 1.5,
  },
});
