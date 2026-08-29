import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import {
  MapPin,
  Clock,
  Download,
  RotateCcw,
  XCircle,
  Zap,
  Phone,
  Store as StoreIcon,
  CheckCircle2,
} from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { Order } from '../../types';
import { useOrderStore } from '../../stores/orderStore';

export const OrderDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId || 'ord-1001';

  const { cancelOrder } = useOrderStore();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    const data = await customerApi.getOrderById(orderId);
    if (data) setOrder(data);
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? Instant refund will be issued.',
      [
        { text: 'No, Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelOrder(orderId, 'Customer requested cancellation');
            loadOrder();
          },
        },
      ]
    );
  };

  if (!order) return null;

  const isLive = order.status === 'IN_TRANSIT' || order.status === 'PREPARING' || order.status === 'CONFIRMED';

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Order Details"
        subtitle={order.orderNumber}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Status Banner */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <CheckCircle2 size={24} color={Colors.primary} />
              <View style={{ marginLeft: Spacing.sm }}>
                <Text style={styles.statusTitle}>
                  {order.status.replace(/_/g, ' ')}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {order.status === 'DELIVERED'
                    ? `Delivered on ${order.deliveredAt || '19 Aug 2026'}`
                    : `Arriving ${order.estimatedDeliveryTime || 'in 12-15 mins'}`}
                </Text>
              </View>
            </View>

            {isLive ? (
              <Button
                title="Live Track"
                onPress={() => navigation.navigate('LiveTracking', { orderId: order.id })}
                icon={<Zap size={14} color={Colors.textInverse} fill={Colors.textInverse} />}
                size="sm"
              />
            ) : null}
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.card}>
          <View style={styles.storeHeader}>
            <StoreIcon size={18} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>{order.store.businessName}</Text>
          </View>
          <Text style={styles.storeAddress}>{order.store.address}</Text>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered ({order.items.length})</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image
                source={{ uri: item.productImage }}
                style={styles.itemThumb}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemVariant}>
                  {item.variantName || '1 unit'} • ₹{item.unitPrice} each
                </Text>
              </View>
              <Text style={styles.itemTotal}>₹{item.totalPrice}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <View style={styles.storeHeader}>
            <MapPin size={18} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addrLine}>{order.deliveryAddress.line1}</Text>
          <Text style={styles.addrCity}>
            {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
          </Text>
        </View>

        {/* Bill Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Breakdown</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>₹{order.subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>
              {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & GST</Text>
            <Text style={styles.billValue}>₹{order.tax}</Text>
          </View>
          {order.discount > 0 ? (
            <View style={styles.billRow}>
              <Text style={styles.discountLabel}>Coupon Savings</Text>
              <Text style={styles.discountValue}>-₹{order.discount}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Paid ({order.paymentMethod})</Text>
            <Text style={styles.grandTotalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

        {/* Action Buttons: Return & Cancel */}
        {order.canReturn ? (
          <Button
            title="Request Return / Replacement"
            onPress={() => navigation.navigate('Returns', { orderId: order.id })}
            icon={<RotateCcw size={16} color={Colors.primary} />}
            variant="outline"
            size="md"
            style={styles.actionBtn}
          />
        ) : null}

        {order.canCancel ? (
          <Button
            title="Cancel Order"
            onPress={handleCancel}
            icon={<XCircle size={16} color={Colors.textInverse} />}
            variant="danger"
            size="md"
            style={styles.actionBtn}
          />
        ) : null}
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
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  statusSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  cardTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeAddress: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    marginRight: Spacing.sm,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemVariant: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  itemTotal: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addrLine: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 4,
  },
  addrCity: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs + 2,
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
  grandTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  grandTotalLabel: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  grandTotalValue: {
    ...Typography.priceLarge,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  actionBtn: {
    marginTop: Spacing.sm,
  },
});
