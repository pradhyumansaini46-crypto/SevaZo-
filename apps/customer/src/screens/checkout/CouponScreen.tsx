import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Tag, CheckCircle2, Percent, Sparkles } from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { Coupon } from '../../types';
import { useCartStore } from '../../stores/cartStore';

export const CouponScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const onApplyCoupon = route.params?.onApplyCoupon;

  const { applyCoupon, getCalculation } = useCartStore();
  const calculation = getCalculation();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    const data = await customerApi.getCoupons();
    setCoupons(data);
  };

  const handleApply = (coupon: Coupon) => {
    if (calculation.itemsTotal < coupon.minOrderAmount) {
      setError(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`);
      return;
    }
    setError('');
    applyCoupon(coupon);
    if (onApplyCoupon) {
      onApplyCoupon(coupon);
    }
    navigation.goBack();
  };

  const handleManualApply = () => {
    if (!manualCode.trim()) return;
    const match = coupons.find(
      (c) => c.code.toUpperCase() === manualCode.trim().toUpperCase()
    );
    if (match) {
      handleApply(match);
    } else {
      // Dynamic fallback coupon
      const customCoupon: Coupon = {
        id: `c-custom-${Date.now()}`,
        code: manualCode.trim().toUpperCase(),
        description: 'Special promo discount applied',
        discountType: 'FIXED',
        discountValue: 30,
        minOrderAmount: 99,
        validUntil: '2026-12-31',
        isActive: true,
      };
      handleApply(customCoupon);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Coupons & Offers"
        subtitle="Save extra on your order"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Manual Coupon Input */}
        <View style={styles.manualInputCard}>
          <Text style={styles.cardHeading}>Have a Promo Code?</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="ENTER PROMO CODE"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              value={manualCode}
              onChangeText={(text) => {
                setManualCode(text);
                if (error) setError('');
              }}
            />
            <Button
              title="Apply"
              onPress={handleManualApply}
              disabled={!manualCode.trim()}
              size="sm"
              style={styles.applyBtn}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Available Coupons List */}
        <Text style={styles.sectionHeading}>Available Coupons for You</Text>

        {coupons.map((c) => {
          const isEligible = calculation.itemsTotal >= c.minOrderAmount;
          return (
            <View key={c.id} style={styles.couponCard}>
              <View style={styles.couponHeader}>
                <View style={styles.codeTag}>
                  <Percent size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.codeText}>{c.code}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleApply(c)}
                  style={[styles.applyActionBtn, !isEligible && styles.applyActionBtnDisabled]}
                >
                  <Text
                    style={[
                      styles.applyActionText,
                      !isEligible && styles.applyActionTextDisabled,
                    ]}
                  >
                    APPLY
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.couponDesc}>{c.description}</Text>

              <View style={styles.couponFooter}>
                <Text style={styles.minOrderText}>
                  Min. Order: ₹{c.minOrderAmount}
                </Text>
                <Text style={styles.validityText}>Valid till {c.validUntil}</Text>
              </View>

              {!isEligible ? (
                <View style={styles.ineligibleWarning}>
                  <Text style={styles.ineligibleText}>
                    Add items worth ₹{c.minOrderAmount - calculation.itemsTotal} more to unlock
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  manualInputCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  cardHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    height: 44,
    paddingHorizontal: Spacing.md,
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  applyBtn: {
    height: 44,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  sectionHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  couponCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  codeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  codeText: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  applyActionBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  applyActionBtnDisabled: {
    backgroundColor: Colors.surfaceElevated,
  },
  applyActionText: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primary,
  },
  applyActionTextDisabled: {
    color: Colors.textMuted,
  },
  couponDesc: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  couponFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  minOrderText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  validityText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  ineligibleWarning: {
    marginTop: Spacing.sm,
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: BorderRadius.xs,
  },
  ineligibleText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
  },
});
