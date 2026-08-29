import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, CheckCircle, Package, ArrowRight } from 'lucide-react-native';
import { Order } from '../types';
import { Colors, BorderRadius, Shadows } from '../theme';
import { Badge } from './Badge';
import { Button } from './Button';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onAccept?: () => void;
  onPreparing?: () => void;
  onReady?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onAccept,
  onPreparing,
  onReady,
}) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
      case 'PREPARING':
        return 'info';
      case 'READY_FOR_PICKUP':
        return 'secondary';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'NEW ORDER';
      case 'CONFIRMED':
        return 'ACCEPTED';
      case 'PREPARING':
        return 'PREPARING';
      case 'READY_FOR_PICKUP':
        return 'READY FOR RIDER';
      case 'DELIVERED':
        return 'DELIVERED';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.timeText}>
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Badge
          label={getStatusLabel(order.status)}
          variant={getBadgeVariant(order.status)}
          dot
        />
      </View>

      <View style={styles.divider} />

      {/* Items list summary */}
      <View style={styles.itemsContainer}>
        {order.items.map((item, idx) => (
          <View key={item.id || idx} style={styles.itemRow}>
            <Text style={styles.itemQty}>{item.quantity}x</Text>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemPrice}>₹{item.total}</Text>
          </View>
        ))}
      </View>

      {order.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>💬 "{order.notes}"</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.amountBox}>
          <Text style={styles.totalLabel}>Total Bill</Text>
          <Text style={styles.totalAmount}>₹{order.total}</Text>
        </View>

        {order.status === 'PENDING' && onAccept && (
          <Button
            title="Accept Order"
            size="sm"
            variant="primary"
            fullWidth={false}
            onPress={onAccept}
            leftIcon={<CheckCircle size={14} color="#FFF" />}
          />
        )}

        {order.status === 'CONFIRMED' && onPreparing && (
          <Button
            title="Start Preparing"
            size="sm"
            variant="secondary"
            fullWidth={false}
            onPress={onPreparing}
            leftIcon={<Package size={14} color="#FFF" />}
          />
        )}

        {order.status === 'PREPARING' && onReady && (
          <Button
            title="Mark Ready"
            size="sm"
            variant="success"
            fullWidth={false}
            onPress={onReady}
            leftIcon={<CheckCircle size={14} color="#FFF" />}
          />
        )}

        {['READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'].includes(order.status) && (
          <TouchableOpacity onPress={onPress} style={styles.viewDetailBtn}>
            <Text style={styles.viewDetailText}>View Details</Text>
            <ArrowRight size={14} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  itemsContainer: {
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
    width: 26,
  },
  itemName: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  notesBox: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: BorderRadius.sm,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 12,
    color: '#92400E',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  amountBox: {},
  totalLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  viewDetailText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },
});
