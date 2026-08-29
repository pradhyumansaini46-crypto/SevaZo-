import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Headphones,
  FileEdit,
  RotateCw,
  Building2,
  Phone,
  Mail,
  Store,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../../components/Button';
import { VendorApi } from '../../services/vendorApi';
import { useToast } from '../../hooks/useToast';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

interface ApplicationStatusSectionProps {
  status: ApplicationStatus;
  applicationId?: string;
  submittedAt?: string;
  rejectionReason?: string | null;
  rejectedSections?: string[];
  requiredAction?: string | null;
  onFixSection?: (sectionKey: string) => void;
  onOpenDashboard?: () => void;
  onResubmit?: () => void;
}

export const ApplicationStatusSection: React.FC<ApplicationStatusSectionProps> = ({
  status = 'UNDER_REVIEW',
  applicationId = 'SVZ-VND-000123',
  submittedAt = '22 Aug 2026',
  rejectionReason = 'GSTIN certificate could not be verified due to low resolution scan.',
  rejectedSections = ['KYC Documents'],
  requiredAction = 'Please upload a clear scanned PDF of your Form GST REG-06 registration certificate.',
  onFixSection,
  onOpenDashboard,
  onResubmit,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const toast = useToast();

  const [resubmitting, setResubmitting] = useState(false);

  const handleSupportContact = () => {
    Linking.openURL('mailto:partners@sevazo.com?subject=Vendor%20Application%20Inquiry%20' + applicationId);
  };

  const handleResubmitAction = async () => {
    setResubmitting(true);
    try {
      await VendorApi.resubmitCorrections({
        section: rejectedSections[0] || 'KYC',
      });
      toast.success('Corrected application resubmitted for admin review!');
      if (onResubmit) onResubmit();
    } catch {
      toast.error('Failed to resubmit application.');
    } finally {
      setResubmitting(false);
    }
  };

  // 1. APPROVED CELEBRATION STATE
  if (status === 'APPROVED') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.celebrationCard, { backgroundColor: colors.surface, borderColor: '#10B981' }]}>
          <View style={[styles.celebrationIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Sparkles size={36} color="#10B981" />
          </View>

          <Text style={[styles.celebrationTitle, { color: colors.textPrimary }]}>
            🎉 Congratulations!
          </Text>
          <Text style={[styles.celebrationSubtitle, { color: colors.textSecondary }]}>
            Your Sevazo Merchant partner application has been approved. Your store is now active and ready to accept orders!
          </Text>

          <View style={[styles.metaCard, { backgroundColor: colors.background }]}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Partner ID</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{applicationId}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Status</Text>
              <View style={[styles.badge, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                <CheckCircle2 size={12} color="#10B981" />
                <Text style={[styles.badgeText, { color: '#065F46' }]}>Active Partner</Text>
              </View>
            </View>
          </View>

          <Button
            title="Open Vendor Dashboard"
            variant="primary"
            size="lg"
            fullWidth
            onPress={onOpenDashboard || (() => {})}
            rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
            style={{ marginTop: 20 }}
          />
        </View>
      </View>
    );
  }

  // 2. REJECTED / NEEDS ATTENTION STATE (Partial Correction Flow)
  if (status === 'REJECTED') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.rejectedCard, { backgroundColor: colors.surface, borderColor: '#EF4444' }]}>
          <View style={[styles.rejectedIconBox, { backgroundColor: '#FEF2F2' }]}>
            <AlertTriangle size={32} color="#EF4444" />
          </View>

          <Text style={[styles.rejectedTitle, { color: colors.textPrimary }]}>
            Application Needs Attention
          </Text>
          <Text style={[styles.rejectedSubtitle, { color: colors.textSecondary }]}>
            Our compliance team reviewed your application and identified items that require correction. You do not have to refill your whole application.
          </Text>

          {/* Rejection Details Box */}
          <View style={styles.issueDetailsBox}>
            <Text style={styles.issueLabel}>Reason for Rejection:</Text>
            <Text style={styles.issueReasonText}>{rejectionReason}</Text>

            {requiredAction && (
              <View style={styles.actionWrap}>
                <Text style={styles.issueLabel}>Required Action:</Text>
                <Text style={styles.actionText}>{requiredAction}</Text>
              </View>
            )}
          </View>

          {/* Rejected Sections List */}
          <View style={styles.rejectedSectionsList}>
            <Text style={[styles.sectionListHeading, { color: colors.textPrimary }]}>
              Sections Requiring Fixes:
            </Text>
            {rejectedSections.map((sec, idx) => (
              <View key={idx} style={[styles.sectionFixRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.secFixTitle, { color: colors.textPrimary }]}>{sec}</Text>
                  <Text style={[styles.secFixSub, { color: '#EF4444' }]}>Action Required</Text>
                </View>
                <TouchableOpacity
                  onPress={() => onFixSection && onFixSection(sec)}
                  style={[styles.fixBtn, { backgroundColor: colors.primary }]}
                >
                  <FileEdit size={14} color="#FFFFFF" />
                  <Text style={styles.fixBtnText}>Fix Section</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Resubmit CTA */}
          <View style={styles.resubmitActions}>
            <Button
              title="Resubmit Corrected Application"
              variant="primary"
              size="lg"
              fullWidth
              loading={resubmitting}
              onPress={handleResubmitAction}
              leftIcon={<RotateCw size={16} color="#FFFFFF" />}
            />
            <Button
              title="Contact Partner Support"
              variant="outline"
              size="md"
              fullWidth
              onPress={handleSupportContact}
              leftIcon={<Headphones size={16} color={colors.primary} />}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  // 3. SUSPENDED STATE
  if (status === 'SUSPENDED') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.rejectedCard, { backgroundColor: colors.surface, borderColor: '#64748B' }]}>
          <View style={[styles.rejectedIconBox, { backgroundColor: '#F1F5F9' }]}>
            <ShieldAlert size={32} color="#475569" />
          </View>
          <Text style={[styles.rejectedTitle, { color: colors.textPrimary }]}>
            Account Suspended
          </Text>
          <Text style={[styles.rejectedSubtitle, { color: colors.textSecondary }]}>
            Your vendor merchant account is currently suspended. Please contact Sevazo Partner Operations to appeal or resolve compliance flags.
          </Text>
          <Button
            title="Contact Sevazo Legal & Support"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSupportContact}
            style={{ marginTop: 20 }}
          />
        </View>
      </View>
    );
  }

  // 4. UNDER_REVIEW / SUBMITTED DEFAULT STATE
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.reviewIconBox, { backgroundColor: '#EFF6FF' }]}>
          <Clock size={36} color="#3B82F6" />
        </View>

        <Text style={[styles.reviewTitle, { color: colors.textPrimary }]}>
          Application Under Review
        </Text>
        <Text style={[styles.reviewSubtitle, { color: colors.textSecondary }]}>
          Your Sevazo merchant application has been submitted and is currently being audited by our verification team.
        </Text>

        {/* Progress Bar 100% */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Application Progress</Text>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>100% Submitted</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: '100%' }]} />
          </View>
        </View>

        {/* Metadata Details */}
        <View style={[styles.metaCard, { backgroundColor: colors.background }]}>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Application ID</Text>
            <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{applicationId}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Submitted On</Text>
            <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{submittedAt}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Verification Status</Text>
            <View style={[styles.badge, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}>
              <Clock size={12} color="#3B82F6" />
              <Text style={[styles.badgeText, { color: '#1E40AF' }]}>Under Review</Text>
            </View>
          </View>
        </View>

        {/* SLA Notice */}
        <View style={[styles.slaBox, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.slaText, { color: colors.primary }]}>
            ⏱ Verification typically completes within 24 to 48 business hours. You will receive an SMS & WhatsApp notification once approved.
          </Text>
        </View>

        {/* Support Action */}
        <Button
          title="Contact Partner Support"
          variant="outline"
          size="md"
          fullWidth
          onPress={handleSupportContact}
          leftIcon={<Headphones size={16} color={colors.primary} />}
          style={{ marginTop: 16 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  reviewCard: {
    padding: 20,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    ...Shadows.card,
  },
  reviewIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  reviewSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metaCard: {
    width: '100%',
    padding: 14,
    borderRadius: BorderRadius.lg,
    gap: 10,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  slaBox: {
    width: '100%',
    padding: 12,
    borderRadius: BorderRadius.md,
  },
  slaText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  celebrationCard: {
    padding: 24,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
    ...Shadows.elevated,
  },
  celebrationIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  rejectedCard: {
    padding: 20,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    ...Shadows.card,
  },
  rejectedIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  rejectedTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  rejectedSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  issueDetailsBox: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 16,
    gap: 6,
  },
  issueLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    textTransform: 'uppercase',
  },
  issueReasonText: {
    fontSize: 13,
    color: '#7F1D1D',
    fontWeight: '600',
    lineHeight: 18,
  },
  actionWrap: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  rejectedSectionsList: {
    gap: 10,
    marginBottom: 20,
  },
  sectionListHeading: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionFixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 10,
  },
  secFixTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  secFixSub: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  fixBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  fixBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  resubmitActions: {
    marginTop: 8,
  },
});
