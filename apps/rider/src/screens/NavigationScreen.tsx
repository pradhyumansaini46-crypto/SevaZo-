import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Navigation as NavIcon, MapPin, Phone, Building, ArrowRight, Shield } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useDeliveryStore } from '../store/deliveryStore';

export const NavigationScreen = ({ navigation }: any) => {
  const { activeDelivery, updateDeliveryStatus } = useDeliveryStore();

  const handleArriveAtVendor = () => {
    updateDeliveryStatus('RIDER_AT_VENDOR');
    navigation.navigate('PickupVerification', { deliveryId: activeDelivery?.id });
  };

  return (
    <View style={styles.container}>
      {/* Visual In-App Tactical Navigation Map Simulator */}
      <View style={styles.mapArea}>
        <View style={styles.mapGridOverlay}>
          <View style={styles.routePolyline} />
          <View style={styles.riderPin}>
            <NavIcon size={20} color="#0F172A" />
          </View>
          <View style={styles.storePin}>
            <Building size={20} color="#0F172A" />
          </View>
        </View>

        {/* Turn-by-Turn Instruction Banner */}
        <View style={styles.turnBanner}>
          <NavIcon size={28} color="#38BDF8" />
          <View style={styles.turnInfo}>
            <Text style={styles.turnDistance}>In 250 meters</Text>
            <Text style={styles.turnAction}>Turn left onto Outer Ring Rd towards GK 1 Market</Text>
          </View>
        </View>
      </View>

      {/* Target Destination Drawer */}
      <View style={styles.drawer}>
        <View style={styles.targetHeader}>
          <View style={styles.targetIconCircle}>
            <Building size={20} color="#38BDF8" />
          </View>
          <View style={styles.targetDetails}>
            <Text style={styles.targetType}>PICKUP DESTINATION</Text>
            <Text style={styles.targetName}>{activeDelivery?.vendor.name}</Text>
            <Text style={styles.targetAddress} numberOfLines={1}>{activeDelivery?.vendor.address}</Text>
          </View>
        </View>

        <View style={styles.tripStatsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statVal}>1.2 km</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>ETA</Text>
            <Text style={styles.statVal}>4 mins</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Items</Text>
            <Text style={styles.statVal}>{activeDelivery?.items.length} pkgs</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.arrivedButton} onPress={handleArriveAtVendor}>
          <Text style={styles.arrivedText}>I HAVE ARRIVED AT STORE</Text>
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
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGridOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  routePolyline: {
    width: 220,
    height: 4,
    backgroundColor: '#38BDF8',
    transform: [{ rotate: '-35deg' }],
  },
  riderPin: {
    position: 'absolute',
    left: '30%',
    top: '55%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  storePin: {
    position: 'absolute',
    right: '30%',
    top: '35%',
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
    borderColor: '#38BDF8',
  },
  turnInfo: {
    flex: 1,
  },
  turnDistance: {
    ...Typography.bodySmall,
    color: '#FF6600',
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
    marginBottom: Spacing.lg,
  },
  targetIconCircle: {
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
    letterSpacing: 0.5,
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
  tripStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  statVal: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginTop: 2,
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

export default NavigationScreen;
