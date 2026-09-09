import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Store, ChevronDown } from 'lucide-react-native';
import { Colors, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';
import { useCartStore } from '../../stores/cartStore';

interface BlinkitHeaderProps {
  etaMinutes?: number;
  distanceKm?: number;
  locationAddress?: string;
  locationLabel?: string;
  onPressLocation?: () => void;
  onPressCart?: () => void;
  onPressNotification?: () => void;
}

export const BlinkitHeader: React.FC<BlinkitHeaderProps> = ({
  etaMinutes = 8,
  distanceKm = 1,
  locationLabel = 'HOME',
  locationAddress = 'Kalpatru splendor, 1204',
  onPressLocation,
  onPressCart,
  onPressNotification,
}) => {
  const { getTotalCount, getCalculation } = useCartStore();
  const totalCartCount = getTotalCount();
  const calculation = getCalculation();
  const cartTotal = calculation.grandTotal;
  const hasItems = totalCartCount > 0;
  return (
    <View style={styles.container}>
      {/* Soft lavender/purple gradient backdrop at top like Blinkit */}
      <LinearGradient
        colors={['#EDE9FE', '#F5F3FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackdrop}
      />

      <View style={styles.content}>
        {/* Top Row: "Sevazo in 8 minutes" + Store Pill + Cart Button + Notification Button */}
        <View style={styles.topRow}>
          <View style={styles.leftCol}>
            <Text style={styles.subLabel}>Sevazo in</Text>
            <View style={styles.etaRow}>
              <Text style={styles.etaNumber}>{etaMinutes} minutes</Text>
              <View style={styles.storePill}>
                <Store size={11} color="#0284C7" style={{ marginRight: 3 }} />
                <Text style={styles.storePillText}>{distanceKm} km away</Text>
              </View>
            </View>
          </View>

          {/* Right Action Icons: Modern 3D Cart Button + Modern 3D Notification Button */}
          <View style={styles.rightActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                triggerHaptic('medium');
                onPressCart?.();
              }}
              style={[
                styles.cartButtonBase,
                hasItems ? styles.cartButtonFilled : styles.cartButtonEmpty,
              ]}
            >
              {/* Modern 3D Cart Image */}
              <View style={styles.cartIconContainer}>
                <Image
                  source={require('../../../assets/images/header_cart_3d.jpg')}
                  style={styles.cart3dImg}
                  resizeMode="cover"
                />
                {hasItems ? (
                  <View style={styles.cartBadgePill}>
                    <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
                  </View>
                ) : null}
              </View>

              {/* Items Count & Total Price */}
              <View style={styles.cartTextCol}>
                <Text
                  style={[
                    styles.cartCountLabel,
                    hasItems ? styles.cartCountFilled : styles.cartCountEmpty,
                  ]}
                  numberOfLines={1}
                >
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
                </Text>
                <Text
                  style={[
                    styles.cartPriceLabel,
                    hasItems ? styles.cartPriceFilled : styles.cartPriceEmpty,
                  ]}
                  numberOfLines={1}
                >
                  ₹{cartTotal}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Modern 3D Notification Button right to Cart */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                triggerHaptic('light');
                onPressNotification?.();
              }}
              style={styles.notificationBtn}
            >
              <Image
                source={require('../../../assets/images/header_notification_3d.jpg')}
                style={styles.notification3dIcon}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Address Row: "HOME - Kalpatru splendor, 1204 ▾" */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            triggerHaptic('selection');
            onPressLocation?.();
          }}
          style={styles.addressRow}
        >
          <Text style={styles.addressLabel}>{locationLabel} - </Text>
          <Text numberOfLines={1} style={styles.addressText}>
            {locationAddress}
          </Text>
          <ChevronDown size={15} color="#0F172A" style={styles.chevron} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 48 : 36,
    paddingBottom: 8,
  },
  gradientBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'none',
    marginBottom: -2,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  etaNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  storePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  storePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartButtonBase: {
    height: 40,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 9,
    borderWidth: 1.2,
    ...Shadows.small,
  },
  cartButtonFilled: {
    backgroundColor: '#0C831F', // Signature quick-commerce emerald green
    borderColor: '#059669',
  },
  cartButtonEmpty: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cartIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 9,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    position: 'relative',
  },
  cart3dImg: {
    width: 32,
    height: 32,
    borderRadius: 7,
  },
  cartBadgePill: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#EF4444',
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cartTextCol: {
    justifyContent: 'center',
  },
  cartCountLabel: {
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },
  cartCountFilled: {
    color: 'rgba(255, 255, 255, 0.92)',
  },
  cartCountEmpty: {
    color: '#64748B',
  },
  cartPriceLabel: {
    fontSize: 11.5,
    fontWeight: '900',
    lineHeight: 14,
  },
  cartPriceFilled: {
    color: '#FFFFFF',
  },
  cartPriceEmpty: {
    color: '#0F172A',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  notification3dIcon: {
    width: 33,
    height: 33,
    borderRadius: 7,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  addressText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    maxWidth: 240,
  },
  chevron: {
    marginLeft: 3,
  },
});
