import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { StepTracker } from '../../components/StepTracker';
import { Button } from '../../components/Button';
import {
  Phone,
  MessageSquare,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  Store as StoreIcon,
  Navigation,
  KeyRound,
  HelpCircle,
} from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { LiveTrackingData } from '../../types';

const { width } = Dimensions.get('window');

export const LiveTrackingScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId || 'ord-1001';

  const [tracking, setTracking] = useState<LiveTrackingData | null>(null);

  useEffect(() => {
    loadTracking();
  }, [orderId]);

  const loadTracking = async () => {
    const data = await customerApi.getLiveTracking(orderId);
    setTracking(data);
  };

  if (!tracking) return null;

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Live Order Tracking"
        subtitle={`Order: ${tracking.orderNumber}`}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('Support')}
            style={styles.helpBtn}
          >
            <HelpCircle size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Map Simulation Box */}
        <View style={styles.mapContainer}>
          {/* Map Graphic Background Simulation */}
          <View style={styles.mapGrid}>
            <View style={styles.mapRoadH1} />
            <View style={styles.mapRoadH2} />
            <View style={styles.mapRoadV1} />
            <View style={styles.mapRoadV2} />

            {/* Store Pin */}
            <View style={styles.storePin}>
              <StoreIcon size={16} color={Colors.textInverse} />
              <View style={styles.pinLabel}>
                <Text style={styles.pinLabelText}>Dark Store</Text>
              </View>
            </View>

            {/* Rider Pin */}
            <View style={styles.riderPin}>
              <Navigation size={18} color={Colors.textInverse} />
              <View style={styles.riderPinLabel}>
                <Text style={styles.riderPinLabelText}>Santosh (Rider)</Text>
              </View>
            </View>

            {/* Destination Pin */}
            <View style={styles.destPin}>
              <MapPin size={18} color={Colors.textInverse} />
              <View style={styles.destPinLabel}>
                <Text style={styles.destPinLabelText}>Your House</Text>
              </View>
            </View>
          </View>

          {/* Floating ETA Card on Map */}
          <View style={styles.mapEtaCard}>
            <View style={styles.mapEtaLeft}>
              <Zap size={18} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.mapEtaText}>
                Arriving in {tracking.remainingMinutes} Mins
              </Text>
            </View>
            <Text style={styles.mapDistanceText}>
              {tracking.distanceRemainingKm} km away
            </Text>
          </View>
        </View>

        {/* OTP Verification Pill */}
        <View style={styles.otpCard}>
          <View style={styles.otpLeft}>
            <KeyRound size={20} color="#D97706" />
            <View style={{ marginLeft: Spacing.sm }}>
              <Text style={styles.otpLabel}>Delivery Verification Code</Text>
              <Text style={styles.otpSub}>Share this OTP with rider at doorstep</Text>
            </View>
          </View>
          <View style={styles.otpValueBadge}>
            <Text style={styles.otpValueText}>8392</Text>
          </View>
        </View>

        {/* Rider Profile Card */}
        {tracking.rider ? (
          <View style={styles.riderCard}>
            <View style={styles.riderTop}>
              <Image
                source={{ uri: tracking.rider.avatar }}
                style={styles.riderAvatar}
              />
              <View style={styles.riderInfo}>
                <Text style={styles.riderName}>{tracking.rider.name}</Text>
                <Text style={styles.riderVehicle}>
                  {tracking.rider.vehicleModel} • {tracking.rider.vehiclePlate}
                </Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.riderRating}>★ {tracking.rider.rating}</Text>
                  <Text style={styles.riderDeliveries}>• 1,200+ fast deliveries</Text>
                </View>
              </View>
            </View>

            {/* Call & Chat Buttons */}
            <View style={styles.riderActionsRow}>
              <TouchableOpacity activeOpacity={0.8} style={styles.riderActionBtn}>
                <Phone size={16} color={Colors.primary} />
                <Text style={styles.riderActionText}>Call Rider</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Support')}
                style={styles.riderActionBtn}
              >
                <MessageSquare size={16} color={Colors.secondary} />
                <Text style={[styles.riderActionText, { color: Colors.secondary }]}>
                  Chat
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Step-by-Step Delivery Progress Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineHeading}>Delivery Status Timeline</Text>
          <StepTracker
            steps={tracking.timeline.map((t) => ({
              key: t.step,
              title: t.title,
              subtitle: t.description,
              timestamp: t.timestamp,
              completed: t.completed,
              current: t.current,
            }))}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  helpBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  mapContainer: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#CBD5E1',
  },
  mapRoadH1: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#FFFFFF',
  },
  mapRoadH2: {
    position: 'absolute',
    top: '70%',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#FFFFFF',
  },
  mapRoadV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '30%',
    width: 14,
    backgroundColor: '#FFFFFF',
  },
  mapRoadV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '70%',
    width: 14,
    backgroundColor: '#FFFFFF',
  },
  storePin: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  pinLabel: {
    position: 'absolute',
    bottom: -18,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  pinLabelText: {
    ...Typography.caption,
    fontSize: 8,
    color: Colors.textInverse,
  },
  riderPin: {
    position: 'absolute',
    top: '48%',
    left: '50%',
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
    ...Shadows.card,
  },
  riderPinLabel: {
    position: 'absolute',
    bottom: -18,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  riderPinLabelText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  destPin: {
    position: 'absolute',
    top: '62%',
    left: '78%',
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  destPinLabel: {
    position: 'absolute',
    bottom: -18,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  destPinLabelText: {
    ...Typography.caption,
    fontSize: 8,
    color: Colors.textInverse,
  },
  mapEtaCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.elevated,
  },
  mapEtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapEtaText: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  mapDistanceText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  otpCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  otpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  otpLabel: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: '#92400E',
  },
  otpSub: {
    ...Typography.bodySmall,
    color: '#B45309',
    fontSize: 11,
  },
  otpValueBadge: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: '#D97706',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  otpValueText: {
    ...Typography.priceLarge,
    fontSize: 20,
    color: '#92400E',
    letterSpacing: 2,
  },
  riderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  riderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  riderAvatar: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  riderVehicle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  riderRating: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.starGold,
  },
  riderDeliveries: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  riderActionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  riderActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    marginHorizontal: Spacing.xs,
  },
  riderActionText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 6,
  },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  timelineHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
});
