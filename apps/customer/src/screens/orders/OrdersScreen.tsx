import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { Package, ChevronRight, Zap, RefreshCw, RotateCcw } from 'lucide-react-native';
import { useOrderStore } from '../../stores/orderStore';
import { useCartStore } from '../../stores/cartStore';
import { Order } from '../../types';

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { orders, fetchOrders } = useOrderStore();
  const { addItem } = useCartStore();

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');

  useEffect(() => {
    fetchOrders();
  }, []);

  const activeOrders = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'RETURNED'
  );
  const pastOrders = orders.filter(
    (o) => o.status === 'DELIVERED' || o.status === 'CANCELLED' || o.status === 'RETURNED'
  );

  const displayedOrders = activeTab === 'ACTIVE' ? activeOrders : pastOrders;

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem({
        id: item.productId,
        name: item.productName,
        price: item.unitPrice,
        stock: 50,
        unit: '1 unit',
        images: [item.productImage],
        categoryId: 'cat-1',
        description: item.productName,
        rating: 4.8,
        reviewsCount: 100,
        slug: 'item',
        tags: [],
        vendorId: 'store-1',
        inStock: true,
      });
    });
    navigation.navigate('CartTab');
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Orders"
        subtitle="Track active & past deliveries"
      />

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('ACTIVE')}
          style={[styles.tabBtn, activeTab === 'ACTIVE' && styles.tabBtnActive]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'ACTIVE' && styles.tabTextActive,
            ]}
          >
            Active Orders ({activeOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('PAST')}
          style={[styles.tabBtn, activeTab === 'PAST' && styles.tabBtnActive]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'PAST' && styles.tabTextActive,
            ]}
          >
            Past History ({pastOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <EmptyState
          icon={<Package size={36} color={Colors.primary} />}
          title={activeTab === 'ACTIVE' ? 'No Active Orders' : 'No Past Orders'}
          description={
            activeTab === 'ACTIVE'
              ? 'You have no orders currently in progress. Order your favorite items now!'
              : 'Your delivered order history will appear here.'
          }
          actionTitle="Order Grocery"
          onAction={() => navigation.navigate('HomeTab')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {displayedOrders.map((order) => {
            const isLive = order.status === 'IN_TRANSIT' || order.status === 'PREPARING' || order.status === 'CONFIRMED';
            return (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                style={styles.orderCard}
              >
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <Badge
                    label={order.status.replace(/_/g, ' ')}
                    variant={
                      order.status === 'DELIVERED'
                        ? 'success'
                        : order.status === 'CANCELLED'
                        ? 'danger'
                        : 'primary'
                    }
                  />
                </View>

                {/* Items preview */}
                <View style={styles.itemsPreviewRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {order.items.map((item, idx) => (
                      <View key={idx} style={styles.itemThumbWrap}>
                        <Image
                          source={{ uri: item.productImage }}
                          style={styles.itemThumb}
                        />
                        <View style={styles.qtyBadge}>
                          <Text style={styles.qtyBadgeText}>{item.quantity}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                <Text numberOfLines={1} style={styles.itemNamesSummary}>
                  {order.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                </Text>

                {/* Footer Bar */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.amountLabel}>Total Amount</Text>
                    <Text style={styles.amountValue}>₹{order.totalAmount}</Text>
                  </View>

                  <View style={styles.actionBtnsRow}>
                    {isLive ? (
                      <Button
                        title="Live Track"
                        onPress={() =>
                          navigation.navigate('LiveTracking', { orderId: order.id })
                        }
                        icon={<Zap size={14} color={Colors.textInverse} fill={Colors.textInverse} />}
                        size="sm"
                      />
                    ) : (
                      <Button
                        title="Reorder"
                        onPress={() => handleReorder(order)}
                        icon={<RefreshCw size={14} color={Colors.primary} />}
                        variant="outline"
                        size="sm"
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  tabBtnActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  orderCard: {
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
    marginBottom: Spacing.sm,
  },
  orderNumber: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderDate: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemsPreviewRow: {
    marginVertical: Spacing.xs,
  },
  itemThumbWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    marginRight: Spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  itemThumb: {
    width: '100%',
    height: '100%',
  },
  qtyBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 4,
  },
  qtyBadgeText: {
    ...Typography.caption,
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  itemNamesSummary: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm + 2,
  },
  amountLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  amountValue: {
    ...Typography.titleSmall,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  actionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
