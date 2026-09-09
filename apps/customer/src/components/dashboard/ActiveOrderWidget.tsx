import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Navigation, ShieldCheck } from 'lucide-react-native';
import { Order } from '../../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

interface ActiveOrderWidgetProps {
  order: Order;
  onPressTrack: (orderId: string) => void;
}

export const ActiveOrderWidget: React.FC<ActiveOrderWidgetProps> = ({
  order,
  onPressTrack,
}) => {
  const handlePress = () => {
    triggerHaptic('medium');
    onPressTrack(order.id);
  };

  const statusText =
    order.status === 'IN_TRANSIT'
      ? 'On the way'
      : order.status === 'PREPARING'
      ? 'Packing your order'
      : 'Order confirmed';

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <View style={styles.statusPill}>
          <View style={styles.pulsingDot} />
          <Text style={styles.statusPillText}>{statusText.toUpperCase()}</Text>
        </View>
        <Text style={styles.orderIdText}>Order #{order.orderNumber}</Text>
      </View>

      <View style={styles.middleRow}>
        <View style={styles.riderAvatar}>
          <Text style={styles.riderEmoji}>🛵</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.etaText}>
            {order.estimatedDeliveryTime || 'Arriving shortly'}
          </Text>
          <Text style={styles.itemsSummary} numberOfLines={1}>
            {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
          </Text>
        </View>
        <View style={styles.trackButton}>
          <Text style={styles.trackButtonText}>Track</Text>
          <ChevronRight size={14} color={Colors.textInverse} />
        </View>
      </View>

      {order.deliveryOtp ? (
        <View style={styles.footerRow}>
          <View style={styles.otpBox}>
            <ShieldCheck size={12} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.otpLabel}>Delivery PIN:</Text>
            <Text style={styles.otpValue}>{order.deliveryOtp}</Text>
          </View>
          <Text style={styles.storeNameText} numberOfLines={1}>
            From {order.store?.businessName || 'SevaZo Express'}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.medium,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusPillText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
  },
  orderIdText: {
    ...Typography.caption,
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 10,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  riderAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  riderEmoji: {
    fontSize: 20,
  },
  infoCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  etaText: {
    ...Typography.titleSmall,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  itemsSummary: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  trackButtonText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textInverse,
    marginRight: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  otpBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: '#94A3B8',
    marginRight: 4,
  },
  otpValue: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 1,
  },
  storeNameText: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: '#64748B',
    maxWidth: 150,
  },
});
