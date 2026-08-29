import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Edit3,
  HelpCircle,
  Sparkles,
  PhoneCall,
} from 'lucide-react-native';
import { getThemeColors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useAuthStore } from '../../stores/authStore';
import { VendorApi } from '../../services/vendorApi';
import { VendorStatus } from '../../types';

export const StatusTrackerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';
  const { vendor, updateVendor } = useAuthStore();

  const [onboardingState, setOnboardingState] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const state = await VendorApi.getOnboardingState();
      setOnboardingState(state);
      if (state.data) {
        updateVendor(state.data);
      }
      if (state.status === 'APPROVED') {
        navigation.replace('Main');
      } else if (state.status === 'REJECTED') {
        navigation.replace('Correction');
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const currentStatus: VendorStatus = onboardingState?.status || vendor?.status || 'SUBMITTED';

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'APPROVED':
        return <Badge label="APPROVED & ACTIVE" variant="success" size="md" dot />;
      case 'UNDER_REVIEW':
        return <Badge label="UNDER ACTIVE VERIFICATION" variant="warning" size="md" dot />;
      case 'SUBMITTED':
        return <Badge label="APPLICATION SUBMITTED" variant="info" size="md" dot />;
      case 'REJECTED':
        return <Badge label="ACTION REQUIRED / REJECTED" variant="danger" size="md" dot />;
      case 'SUSPENDED':
        return <Badge label="ACCOUNT SUSPENDED" variant="danger" size="md" dot />;
      default:
        return <Badge label="DRAFT IN PROGRESS" variant="neutral" size="md" dot />;
    }
  };

  const checklistItems = [
    { label: 'Business Type & Catalog Classification', checked: onboardingState?.checklist?.step1_businessType ?? true },
    { label: 'Owner Identification & Mobile Verification', checked: onboardingState?.checklist?.step2_ownerDetails ?? true },
    { label: 'Legal Firm Name & Entity Structure', checked: onboardingState?.checklist?.step3_businessDetails ?? true },
    { label: 'Store Pickup Address & Geo-Pin', checked: onboardingState?.checklist?.step4_businessAddress ?? true },
    { label: 'Statutory KYC Documents (GST, PAN, FSSAI)', checked: onboardingState?.checklist?.step5_documents ?? true },
    { label: 'Direct Settlement Bank Account', checked: onboardingState?.checklist?.step6_bankAccount ?? true },
    { label: 'Storefront Setup & Preparation Window', checked: onboardingState?.checklist?.step7_storeDetails ?? true },
    { label: 'Service Area & Hyperlocal Delivery Model', checked: onboardingState?.checklist?.step8_deliveryPreferences ?? true },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Application Status"
        subtitle="Verification & compliance progress"
        rightAction={
          <TouchableOpacity onPress={loadStatus} style={[styles.refreshIcon, { backgroundColor: colors.borderLight }]}>
            <RefreshCw size={16} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) + 30 }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStatus} />}
      >
        {/* Status Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroLeft}>
              <Text style={[styles.storeTitle, { color: colors.textPrimary }]}>
                {vendor?.storeName || vendor?.businessName || 'Fresh Supermarket'}
              </Text>
              <Text style={[styles.appId, { color: colors.textMuted }]}>
                Application Ref: #{vendor?.id?.slice(0, 8).toUpperCase() || 'VND-884102'}
              </Text>
            </View>
            {getStatusBadge()}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          {/* Under Review Notice */}
          <View style={[styles.statusNotice, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
            <Clock size={20} color="#F59E0B" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.noticeTitle, { color: colors.textPrimary }]}>
                Estimated Verification SLA: 24 - 48 Hours
              </Text>
              <Text style={[styles.noticeDesc, { color: colors.textSecondary }]}>
                Our compliance team is verifying your GST, FSSAI, and settlement bank credentials. You will receive an SMS upon activation.
              </Text>
            </View>
          </View>
        </View>

        {/* 4-Step Visual Timeline */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Verification Journey</Text>

        <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          {[
            { step: '1', title: 'Application Submitted', desc: 'Merchant profile and KYC documents submitted', done: true },
            { step: '2', title: 'Legal & KYC Verification', desc: 'GST, PAN and food safety license validation', done: true, inProgress: true },
            { step: '3', title: 'Store Profile & Delivery Routing', desc: 'Geofencing, radius check & rider routing', done: false },
            { step: '4', title: 'Live Dashboard & Payout Activation', desc: 'Store goes live on Sevazo instant commerce', done: false },
          ].map((item, idx) => (
            <View key={idx} style={styles.timelineRow}>
              <View style={styles.timelineIconCol}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: item.done ? colors.success : item.inProgress ? colors.warning : colors.borderLight,
                    },
                  ]}
                >
                  {item.done ? (
                    <CheckCircle2 size={14} color="#FFF" />
                  ) : item.inProgress ? (
                    <Clock size={14} color="#FFF" />
                  ) : (
                    <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>{item.step}</Text>
                  )}
                </View>
                {idx < 3 && <View style={[styles.timelineLine, { backgroundColor: item.done ? colors.success : colors.borderLight }]} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.timelineDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Verification Checklist */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Submitted Compliance Checklist</Text>
        <View style={[styles.checklistCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          {checklistItems.map((item, idx) => (
            <View key={idx} style={[styles.checklistItem, idx < checklistItems.length - 1 && { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
              <CheckCircle2 size={18} color={item.checked ? colors.success : colors.textMuted} />
              <Text style={[styles.checklistText, { color: colors.textPrimary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Merchant Support Footer */}
        <View style={[styles.supportBox, { backgroundColor: isDark ? '#132822' : '#E3FDF5', borderColor: isDark ? '#059669' : '#A7F3D0' }]}>
          <HelpCircle size={20} color={colors.primary} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.supportTitle, { color: isDark ? '#A7F3D0' : colors.primaryDark }]}>
              Need Expedited Approval?
            </Text>
            <Text style={[styles.supportDesc, { color: isDark ? '#E2E8F0' : colors.textSecondary }]}>
              Contact our Merchant Onboarding Desk at 1800-SEVAZO-MERCHANT or write to onboarding@sevazo.com.
            </Text>
          </View>
        </View>

        {/* Quick Testing Switchers */}
        <View style={[styles.devSwitcher, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text style={[styles.devTitle, { color: colors.textMuted }]}>🧪 PREVIEW ROLE SIMULATOR</Text>
          <View style={styles.devButtonsRow}>
            <TouchableOpacity
              onPress={() => navigation.replace('Main')}
              style={[styles.devPill, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.devPillText}>Simulate Approved ➔ Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.replace('Correction')}
              style={[styles.devPill, { backgroundColor: '#EF4444' }]}
            >
              <Text style={styles.devPillText}>Simulate Rejection ➔ Fix</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.xl,
  },
  refreshIcon: {
    padding: 8,
    borderRadius: BorderRadius.md,
  },
  heroCard: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 20,
    ...Shadows.card,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  appId: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  statusNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: BorderRadius.lg,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  noticeDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  timelineCard: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIconCol: {
    alignItems: 'center',
    marginRight: 14,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    height: 36,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  timelineDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  checklistCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checklistText: {
    fontSize: 13,
    marginLeft: 12,
    fontWeight: '500',
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 20,
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  supportDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  devSwitcher: {
    padding: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  devTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  devButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  devPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
