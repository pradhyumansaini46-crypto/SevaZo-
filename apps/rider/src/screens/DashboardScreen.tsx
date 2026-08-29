import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import {
  Bike,
  Zap,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Bell,
  Star,
  Package,
  AlertCircle,
  CheckCircle2,
  FileText,
  Lock,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { useDeliveryStore } from '../store/deliveryStore';

export const DashboardScreen = ({ navigation }: any) => {
  const { rider, status: authStatus, toggleOnline } = useAuthStore();
  const { applicationId, loadOnboardingState } = useOnboardingStore();
  const { activeDelivery, pendingOffers } = useDeliveryStore();

  const [isOnline, setIsOnline] = useState(rider?.isOnline ?? false);
  const [onboardingStatus, setOnboardingStatus] = useState<'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DRAFT'>('UNDER_REVIEW');

  // Pulsing / Blinking animation for pending verification
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start continuous blinking / pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Check onboarding status
    loadOnboardingState().then((state) => {
      if (state?.status) {
        setOnboardingStatus(state.status as any);
      }
    });
  }, []);

  const isUnderReview =
    onboardingStatus === 'UNDER_REVIEW' ||
    rider?.approvalStatus === 'UNDER_REVIEW' ||
    rider?.approvalStatus === 'PENDING' ||
    authStatus === 'SUBMITTED' ||
    authStatus === 'UNDER_REVIEW';

  const isRejected =
    onboardingStatus === 'REJECTED' ||
    rider?.approvalStatus === 'REJECTED' ||
    authStatus === 'REJECTED';

  const isApproved =
    !isUnderReview && !isRejected && (rider?.approvalStatus === 'APPROVED' || authStatus === 'APPROVED');

  const handleToggleOnline = () => {
    if (isUnderReview) {
      Alert.alert(
        'Document Verification In-Progress',
        'Your profile is currently under review by Admin. You will be able to go online and accept delivery orders as soon as your documents are verified.',
        [
          { text: 'Check Status', onPress: () => navigation.navigate('ApplicationStatus') },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }

    if (isRejected) {
      Alert.alert(
        'Application Needs Correction',
        'Your document verification was rejected by Admin. Please re-upload the required documents to activate your account.',
        [
          { text: 'Re-upload', onPress: () => navigation.navigate('OnboardingResume') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    const nextState = !isOnline;
    setIsOnline(nextState);
    toggleOnline(nextState);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Greeting & Notification Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Image
            source={{
              uri:
                rider?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.riderName}>{rider?.name || 'Rahul'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Bell size={20} color={Colors.textPrimary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* CONTINUOUS BLINKING / PULSING NOTIFICATION: UNDER ADMIN REVIEW */}
      {isUnderReview && (
        <TouchableOpacity
          style={styles.reviewBannerCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ApplicationStatus')}
        >
          <View style={styles.reviewBannerHeader}>
            <View style={styles.reviewBadge}>
              <Animated.View style={[styles.pulsingDot, { opacity: pulseAnim }]} />
              <Text style={styles.reviewBadgeText}>VERIFICATION PENDING</Text>
            </View>
            <Text style={styles.appIdText}>{applicationId || 'SVZ-RID-000123'}</Text>
          </View>

          <Text style={styles.reviewBannerTitle}>
            Documents Under Admin Review
          </Text>
          <Text style={styles.reviewBannerDesc}>
            Your KYC, Driving License, RC & Bank details have been submitted. Admin verification is
            in-progress. You will receive an instant notification once approved.
          </Text>

          <View style={styles.reviewBannerFooter}>
            <View style={styles.docStatusRow}>
              <FileText size={14} color="#EA580C" />
              <Text style={styles.docStatusText}>Action Awaiting: Admin Ops</Text>
            </View>
            <View style={styles.trackLinkRow}>
              <Text style={styles.trackLinkText}>View Status</Text>
              <ArrowRight size={14} color="#EA580C" />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* REJECTED ALERT BANNER */}
      {isRejected && (
        <TouchableOpacity
          style={styles.rejectedBannerCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('OnboardingResume')}
        >
          <View style={styles.reviewBannerHeader}>
            <View style={styles.rejectedBadge}>
              <AlertCircle size={14} color="#B91C1C" />
              <Text style={styles.rejectedBadgeText}>ACTION REQUIRED</Text>
            </View>
          </View>

          <Text style={styles.rejectedBannerTitle}>
            Document Verification Needs Update
          </Text>
          <Text style={styles.rejectedBannerDesc}>
            Admin requested updates on your submitted documents. Please tap below to correct and resubmit.
          </Text>

          <View style={styles.rejectedBtnRow}>
            <Text style={styles.rejectedBtnText}>Resubmit Documents ➔</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* APPROVED BANNER */}
      {isApproved && (
        <View style={styles.approvedBannerCard}>
          <View style={styles.approvedIconWrap}>
            <ShieldCheck size={18} color="#065F46" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.approvedTitle}>Verified Partner Profile</Text>
            <Text style={styles.approvedDesc}>Your documents are verified. You are authorized to accept trips.</Text>
          </View>
        </View>
      )}

      {/* OFFLINE / ONLINE Status Card with GO ONLINE Action */}
      <View style={[styles.mainStatusCard, isOnline ? styles.onlineStatusCard : styles.offlineStatusCard]}>
        <View style={styles.statusHeaderRow}>
          <View style={[styles.statusPill, isOnline ? styles.statusPillOnline : styles.statusPillOffline]}>
            <Text style={[styles.statusDot, isOnline && styles.statusDotOnline]}>●</Text>
            <Text style={[styles.statusStateText, isOnline && styles.statusStateTextOnline]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
          <Text style={styles.vehicleTypeTag}>
            {rider?.vehicleType === 'BICYCLE' ? '🚲 Bicycle' : '🏍️ Motorcycle'}
          </Text>
        </View>

        <Text style={styles.statusDescription}>
          {isUnderReview
            ? 'Account verification pending. Admin approval required before going online.'
            : isOnline
            ? 'You are actively receiving nearby delivery requests from local hubs.'
            : 'You are currently off-duty. Tap below to start receiving orders.'}
        </Text>

        <TouchableOpacity
          style={[
            styles.onlineToggleButton,
            isUnderReview
              ? styles.lockedBtn
              : isOnline
              ? styles.goOfflineBtn
              : styles.goOnlineBtn,
          ]}
          onPress={handleToggleOnline}
          activeOpacity={0.8}
        >
          {isUnderReview && <Lock size={16} color="#9A3412" style={{ marginRight: 6 }} />}
          <Text
            style={[
              styles.toggleBtnText,
              isUnderReview
                ? styles.lockedBtnText
                : isOnline
                ? styles.goOfflineText
                : styles.goOnlineText,
            ]}
          >
            {isUnderReview ? 'VERIFICATION PENDING (LOCKED)' : isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Itemized Metrics & Earnings Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Today's Earnings</Text>
          <Text style={styles.metricValuePrimary}>₹1,240</Text>
          <Text style={styles.metricSub}>+ ₹180 Tips</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Deliveries</Text>
          <Text style={styles.metricValue}>12</Text>
          <Text style={styles.metricSub}>Assigned Today</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Completed</Text>
          <Text style={styles.metricValueSuccess}>10</Text>
          <Text style={styles.metricSub}>83% Fulfillment</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Rating</Text>
          <Text style={styles.metricValueWarning}>⭐ 4.8</Text>
          <Text style={styles.metricSub}>342 Total Trips</Text>
        </View>
      </View>

      {/* Pending Delivery Offer Alert (If Available) */}
      {pendingOffers.length > 0 && isOnline && (
        <View style={styles.offerBanner}>
          <View style={styles.offerHeader}>
            <View style={styles.urgentBadge}>
              <Zap size={14} color="#0F172A" fill="#F59E0B" />
              <Text style={styles.urgentText}>NEW ORDER OFFER</Text>
            </View>
            <Text style={styles.offerTimer}>28s</Text>
          </View>

          <Text style={styles.offerVendor}>{pendingOffers[0].vendorName}</Text>
          <Text style={styles.offerDistance}>
            📍 {pendingOffers[0].distanceToStoreKm} km away • {pendingOffers[0].estimatedMinutes} mins
          </Text>

          <View style={styles.offerActionRow}>
            <View>
              <Text style={styles.payoutLabel}>Est. Payout</Text>
              <Text style={styles.payoutValue}>₹{pendingOffers[0].estimatedEarnings}</Text>
            </View>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: pendingOffers[0].deliveryId })}
            >
              <Text style={styles.acceptText}>View & Accept</Text>
              <ArrowRight size={16} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active Ongoing Order Widget (If in transit/assigned) */}
      {activeDelivery && (
        <View style={styles.activeOrderCard}>
          <View style={styles.activeHeader}>
            <View style={styles.activeBadge}>
              <Bike size={14} color="#38BDF8" />
              <Text style={styles.activeBadgeText}>ACTIVE TRIP IN PROGRESS</Text>
            </View>
            <Text style={styles.orderNumber}>{activeDelivery.orderNumber}</Text>
          </View>

          <Text style={styles.storeName}>{activeDelivery.vendor.name}</Text>
          <Text style={styles.storeAddress} numberOfLines={1}>{activeDelivery.vendor.address}</Text>

          <View style={styles.tripMetrics}>
            <View style={styles.metricItem}>
              <Clock size={14} color="#94A3B8" />
              <Text style={styles.metricItemText}>{activeDelivery.estimatedMinutes} mins</Text>
            </View>
            <View style={styles.metricItem}>
              <MapPin size={14} color="#94A3B8" />
              <Text style={styles.metricItemText}>{activeDelivery.distanceKm} km</Text>
            </View>
            <View style={styles.metricItem}>
              <Package size={14} color="#94A3B8" />
              <Text style={styles.metricItemText}>{activeDelivery.items.length} items</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.resumeTripButton}
            onPress={() => navigation.navigate('Navigation', { deliveryId: activeDelivery.id })}
          >
            <Text style={styles.resumeTripText}>Open Live Navigation</Text>
            <ArrowRight size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Shift Target & Performance Tracker */}
      <View style={styles.targetCard}>
        <View style={styles.targetHeader}>
          <View>
            <Text style={styles.targetTitle}>Daily Incentive Target</Text>
            <Text style={styles.targetSub}>Complete 15 deliveries to unlock ₹300 bonus</Text>
          </View>
          <TrendingUp size={22} color="#10B981" />
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '66%' }]} />
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.progressText}>10 / 15 Completed</Text>
          <Text style={styles.progressPercent}>66% Achieved</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    marginBottom: Spacing.xs,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FF6600',
  },
  greetingText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  riderName: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6600',
  },

  // LIVE BLINKING VERIFICATION BANNER
  reviewBannerCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFBB70',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.xs,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
  },
  reviewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: 0.5,
  },
  appIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A3412',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  reviewBannerTitle: {
    ...Typography.titleSmall,
    color: '#7C2D12',
    fontWeight: '800',
    fontSize: 15,
    marginTop: 2,
  },
  reviewBannerDesc: {
    ...Typography.bodySmall,
    color: '#9A3412',
    fontSize: 12,
    lineHeight: 17,
  },
  reviewBannerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
  },
  docStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  docStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A3412',
  },
  trackLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },

  // REJECTED BANNER
  rejectedBannerCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rejectedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#991B1B',
  },
  rejectedBannerTitle: {
    ...Typography.titleSmall,
    color: '#7F1D1D',
    fontWeight: '800',
  },
  rejectedBannerDesc: {
    ...Typography.bodySmall,
    color: '#991B1B',
    fontSize: 12,
  },
  rejectedBtnRow: {
    marginTop: 4,
  },
  rejectedBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },

  // APPROVED BANNER
  approvedBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  approvedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvedTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: '#065F46',
  },
  approvedDesc: {
    ...Typography.bodySmall,
    color: '#047857',
    fontSize: 11,
  },

  // Status Card
  mainStatusCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...Shadows.card,
  },
  offlineStatusCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  onlineStatusCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statusPillOffline: {
    backgroundColor: '#E2E8F0',
  },
  statusPillOnline: {
    backgroundColor: '#DCFCE7',
  },
  statusDot: {
    fontSize: 12,
    color: '#64748B',
  },
  statusDotOnline: {
    color: '#10B981',
  },
  statusStateText: {
    ...Typography.titleSmall,
    color: '#64748B',
    letterSpacing: 1,
  },
  statusStateTextOnline: {
    color: '#10B981',
  },
  vehicleTypeTag: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statusDescription: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  onlineToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  goOnlineBtn: {
    backgroundColor: '#10B981',
  },
  goOfflineBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  lockedBtn: {
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  toggleBtnText: {
    ...Typography.titleMedium,
    fontWeight: '800',
    letterSpacing: 1,
  },
  goOnlineText: {
    color: '#FFFFFF',
  },
  goOfflineText: {
    color: '#475569',
  },
  lockedBtnText: {
    color: '#9A3412',
    fontSize: 13,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  metricLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
  },
  metricValuePrimary: {
    ...Typography.titleLarge,
    color: '#FF6600',
  },
  metricValueSuccess: {
    ...Typography.titleLarge,
    color: '#10B981',
  },
  metricValueWarning: {
    ...Typography.titleLarge,
    color: '#F59E0B',
  },
  metricSub: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Offer Banner
  offerBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  urgentText: {
    ...Typography.caption,
    color: '#92400E',
    fontWeight: '800',
  },
  offerTimer: {
    ...Typography.titleMedium,
    color: '#B45309',
    fontWeight: '700',
  },
  offerVendor: {
    ...Typography.titleMedium,
    color: '#1E293B',
  },
  offerDistance: {
    ...Typography.bodySmall,
    color: '#64748B',
  },
  offerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  payoutLabel: {
    ...Typography.caption,
    color: '#78716C',
  },
  payoutValue: {
    ...Typography.titleLarge,
    color: '#10B981',
    fontWeight: '800',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  acceptText: {
    ...Typography.bodyMedium,
    color: '#0F172A',
    fontWeight: '700',
  },

  // Active Order Card
  activeOrderCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  activeBadgeText: {
    ...Typography.caption,
    color: '#0284C7',
    fontWeight: '800',
  },
  orderNumber: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  storeName: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
  },
  storeAddress: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  tripMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricItemText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  resumeTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  resumeTripText: {
    ...Typography.titleSmall,
    color: '#0F172A',
    fontWeight: '700',
  },

  // Daily Target Card
  targetCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  targetTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  targetSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  progressPercent: {
    ...Typography.caption,
    color: '#10B981',
    fontWeight: '700',
  },
});

export default DashboardScreen;
