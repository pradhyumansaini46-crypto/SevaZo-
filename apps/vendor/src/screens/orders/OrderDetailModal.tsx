import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  MapPin,
  Phone,
  Bike,
  CreditCard,
  Printer,
  CheckCircle,
  Package,
  XCircle,
} from 'lucide-react-native';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Order } from '../../types';
import { Colors, BorderRadius, Shadows, Spacing } from '../../theme';
import { VendorApi } from '../../services/vendorApi';

interface OrderDetailModalProps {
  visible: boolean;
  order: Order;
  onClose: () => void;
  onAccept?: () => void;
  onPreparing?: () => void;
  onReady?: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  visible,
  order,
  onClose,
  onAccept,
  onPreparing,
  onReady,
}) => {
  const handlePrintReceipt = () => {
    Alert.alert('Printing Thermal Slip', `Order #${order.orderNumber} sent to Bluetooth thermal printer.`);
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to decline this customer order? (Increases cancellation metric)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject Order',
          style: 'destructive',
          onPress: async () => {
            await VendorApi.rejectOrder(order.id, 'Item out of stock / Store closing');
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} title={`Order #${order.orderNumber}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Status banner */}
        <View style={styles.statusBox}>
          <View>
            <Text style={styles.statusLabel}>Current Order Stage</Text>
            <Text style={styles.statusVal}>{order.status}</Text>
          </View>
          <Badge label={order.paymentStatus} variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'} />
        </View>

        {/* Customer instructions */}
        {order.notes ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>📝 Customer Note / Instructions</Text>
            <Text style={styles.notesText}>"{order.notes}"</Text>
          </View>
        ) : null}

        {/* Order Items Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📦 Ordered Items</Text>
          {order.items.map((item, idx) => (
            <View key={item.id || idx} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemRate}>₹{item.price} each</Text>
              </View>
              <Text style={styles.itemTotal}>₹{item.total}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>₹{order.subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Tax</Text>
            <Text style={styles.summaryVal}>₹{order.tax}</Text>
          </View>
          {order.discount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount Applied</Text>
              <Text style={[styles.summaryVal, { color: Colors.success }]}>-₹{order.discount}</Text>
            </View>
          ) : null}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{order.total}</Text>
          </View>
        </View>

        {/* Delivery & Rider Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📍 Delivery Destination</Text>
          <View style={styles.addressRow}>
            <MapPin size={18} color={Colors.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.custName}>{order.customer?.name || 'Customer'}</Text>
              <Text style={styles.addressText}>
                {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}
              </Text>
            </View>
          </View>

          {order.delivery?.rider ? (
            <View style={styles.riderBox}>
              <Bike size={20} color={Colors.secondary} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.riderName}>{order.delivery.rider.name} (Rider)</Text>
                <Text style={styles.riderVehicle}>
                  {order.delivery.rider.vehicleType} • {order.delivery.rider.vehicleNumber}
                </Text>
              </View>
              <TouchableOpacity style={styles.callRiderBtn}>
                <Phone size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Action Controls */}
        <View style={styles.actionSection}>
          {order.status === 'PENDING' && (
            <View style={{ gap: 10 }}>
              <Button
                title="Accept Order (15 mins prep)"
                onPress={onAccept || (() => {})}
                leftIcon={<CheckCircle size={18} color="#FFFFFF" />}
              />
              <Button
                title="Decline / Reject Order"
                variant="outline"
                onPress={handleReject}
                leftIcon={<XCircle size={18} color={Colors.danger} />}
              />
            </View>
          )}

          {order.status === 'CONFIRMED' && (
            <Button
              title="Start Preparing & Packing"
              variant="secondary"
              onPress={onPreparing || (() => {})}
              leftIcon={<Package size={18} color="#FFFFFF" />}
            />
          )}

          {order.status === 'PREPARING' && (
            <Button
              title="Mark Ready for Rider Pickup"
              variant="success"
              onPress={onReady || (() => {})}
              leftIcon={<CheckCircle size={18} color="#FFFFFF" />}
            />
          )}

          {order.status === 'READY_FOR_PICKUP' && (
            <View style={styles.readyBanner}>
              <CheckCircle size={20} color={Colors.success} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.readyTitle}>🏁 Ready for Logistics Pickup</Text>
                <Text style={styles.readySub}>
                  Order is packed & at counter. Assigned delivery rider will collect parcel for transit & final delivery.
                </Text>
              </View>
            </View>
          )}

          <Button
            title="Print Kitchen / Packaging Receipt"
            variant="ghost"
            onPress={handlePrintReceipt}
            leftIcon={<Printer size={18} color={Colors.primary} />}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 20,
  },
  statusBox: {
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statusVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  notesCard: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  notesText: {
    fontSize: 13,
    color: '#78350F',
    marginTop: 4,
    fontStyle: 'italic',
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
    width: 28,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemRate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  custName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  riderBox: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 10,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  riderVehicle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  callRiderBtn: {
    padding: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
  },
  actionSection: {
    marginTop: 6,
  },
  readyBanner: {
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  readyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  readySub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
