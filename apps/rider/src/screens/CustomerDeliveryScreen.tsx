import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Navigation as NavIcon, User, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useDeliveryStore } from '../store/deliveryStore';

export const CustomerDeliveryScreen = ({ navigation }: any) => {
  const { activeDelivery, updateDeliveryStatus } = useDeliveryStore();

  const handleArriveAtCustomer = () => {
    updateDeliveryStatus('RIDER_AT_CUSTOMER');
    navigation.navigate('DeliveryProof', { deliveryId: activeDelivery?.id });
  };

  return (
    <View style={styles.container}>
      {/* Visual In-Transit Map */}
      <View style={styles.mapArea}>
        <View style={styles.riderPin}>
          <NavIcon size={20} color="#0F172A" />
        </View>
        <View style={styles.customerPin}>
          <User size={20} color="#0F172A" />
        </View>

        {/* Turn-by-turn banner */}
        <View style={styles.turnBanner}>
          <NavIcon size={28} color="#22C55E" />
          <View style={styles.turnInfo}>
            <Text style={styles.turnDistance}>In 400 meters</Text>
            <Text style={styles.turnAction}>Head straight towards Palm Grove Heights Main Gate</Text>
          </View>
        </View>
      </View>

      {/* Customer Contact & Arrive Drawer */}
      <View style={styles.drawer}>
        <View style={styles.targetHeader}>
          <View style={styles.userIconCircle}>
            <User size={20} color="#22C55E" />
          </View>
          <View style={styles.targetDetails}>
            <Text style={styles.targetType}>CUSTOMER DELIVERY</Text>
            <Text style={styles.targetName}>{activeDelivery?.customer.name}</Text>
            <Text style={styles.targetAddress} numberOfLines={2}>{activeDelivery?.customer.address}</Text>
          </View>
        </View>

        {activeDelivery?.customer.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Special Instructions:</Text>
            <Text style={styles.notesText}>{activeDelivery.customer.notes}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.callButton}>
            <Phone size={18} color="#38BDF8" />
            <Text style={styles.callText}>Call Customer (Masked)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.arrivedButton} onPress={handleArriveAtCustomer}>
          <Text style={styles.arrivedText}>I HAVE ARRIVED AT DOORSTEP</Text>
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
  mapArea: {
    flex: 1,
    backgroundColor: '#0B1120',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  riderPin: {
    position: 'absolute',
    left: '35%',
    top: '40%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  customerPin: {
    position: 'absolute',
    right: '35%',
    bottom: '40%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  turnBanner: {
    position: 'absolute',
    top: 50,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  turnInfo: {
    flex: 1,
  },
  turnDistance: {
    ...Typography.bodySmall,
    color: '#22C55E',
    fontWeight: '700',
  },
  turnAction: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  drawer: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  targetHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetDetails: {
    flex: 1,
  },
  targetType: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  targetName: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  targetAddress: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: '#FFF7ED',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
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
  actionRow: {
    marginBottom: Spacing.lg,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  callText: {
    color: '#FF6600',
    fontWeight: '700',
  },
  arrivedButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  arrivedText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default CustomerDeliveryScreen;
