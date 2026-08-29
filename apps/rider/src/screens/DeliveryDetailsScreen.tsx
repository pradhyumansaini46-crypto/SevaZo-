import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  MapPin,
  Clock,
  Package,
  Phone,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  CheckCircle,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useDeliveryStore } from '../store/deliveryStore';

export const DeliveryDetailsScreen = ({ navigation }: any) => {
  const { activeDelivery } = useDeliveryStore();

  const handleStartTrip = () => {
    navigation.navigate('Navigation', { deliveryId: activeDelivery?.id });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.orderNumber}>{activeDelivery?.orderNumber}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>CONFIRMED</Text>
            </View>
          </View>

          <View style={styles.payoutContainer}>
            <Text style={styles.payoutLabel}>Total Trip Earnings</Text>
            <Text style={styles.payoutValue}>₹{activeDelivery?.riderEarning.toFixed(2)}</Text>
            <Text style={styles.payoutSubtext}>Base ₹35 + Distance ₹19.50 + Surge ₹14</Text>
          </View>
        </View>

        {/* Pickup Store Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Building size={18} color="#38BDF8" />
            <Text style={styles.sectionTitle}>1. STORE PICKUP</Text>
          </View>
          <Text style={styles.name}>{activeDelivery?.vendor.name}</Text>
          <Text style={styles.address}>{activeDelivery?.vendor.address}</Text>

          <TouchableOpacity style={styles.phoneButton}>
            <Phone size={14} color="#38BDF8" />
            <Text style={styles.phoneText}>Call Store ({activeDelivery?.vendor.phone})</Text>
          </TouchableOpacity>
        </View>

        {/* Drop Customer Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <User size={18} color="#22C55E" />
            <Text style={styles.sectionTitle}>2. CUSTOMER DROPOFF</Text>
          </View>
          <Text style={styles.name}>{activeDelivery?.customer.name}</Text>
          <Text style={styles.address}>{activeDelivery?.customer.address}</Text>

          {activeDelivery?.customer.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>Delivery Instructions:</Text>
              <Text style={styles.notesText}>{activeDelivery.customer.notes}</Text>
            </View>
          )}
        </View>

        {/* Items Checklist */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Package size={18} color="#F59E0B" />
            <Text style={styles.sectionTitle}>ORDER ITEMS ({activeDelivery?.items.length})</Text>
          </View>

          {activeDelivery?.items.map((item, idx) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <CheckCircle size={16} color="#22C55E" />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartTrip}>
          <Text style={styles.startText}>Start Navigation to Store</Text>
          <ArrowRight size={20} color="#0F172A" />
        </TouchableOpacity>
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
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderNumber: {
    ...Typography.mono,
    color: '#FF6600',
    fontSize: 14,
  },
  badge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  payoutContainer: {
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  payoutLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  payoutValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  payoutSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '800',
  },
  name: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  address: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  phoneText: {
    fontSize: 12,
    color: '#FF6600',
    fontWeight: '600',
  },
  notesBox: {
    backgroundColor: '#FFF7ED',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 2,
  },
  notesText: {
    ...Typography.bodySmall,
    color: '#9A3412',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemQty: {
    fontWeight: '700',
    color: '#FF6600',
    width: 32,
  },
  itemName: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startButton: {
    backgroundColor: '#FF6600',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  startText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default DeliveryDetailsScreen;
