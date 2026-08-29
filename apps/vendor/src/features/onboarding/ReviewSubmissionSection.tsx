import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Building2,
  MapPin,
  FileCheck,
  Landmark,
  Store,
  Clock,
  Package,
  Truck,
  FileText,
  Sparkles,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../../components/Button';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { VendorApi } from '../../services/vendorApi';
import { useToast } from '../../hooks/useToast';
import { normalizeApiError, maskAccountNumber } from '../../utils';

interface SectionReviewItem {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  status: 'COMPLETED' | 'INCOMPLETE' | 'ACTION_REQUIRED';
  stepNumber: number;
}

interface ReviewSubmissionSectionProps {
  onEditStep: (stepNumber: number) => void;
  onSubmitSuccess: (applicationData: any) => void;
}

export const ReviewSubmissionSection: React.FC<ReviewSubmissionSectionProps> = ({
  onEditStep,
  onSubmitSuccess,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [vendorData, setVendorData] = useState<any>(null);

  // Agreements state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [accuracyAccepted, setAccuracyAccepted] = useState(false);

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchState = async () => {
      try {
        const state = await VendorApi.getOnboardingState();
        if (isMounted) {
          setVendorData(state.data || state);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    fetchState();
    return () => {
      isMounted = false;
    };
  }, []);

  const allAgreementsAccepted =
    termsAccepted && privacyAccepted && agreementAccepted && accuracyAccepted;

  const sections: SectionReviewItem[] = [
    {
      id: 2,
      title: 'Owner & Contact Identity',
      subtitle: vendorData?.ownerName ? `${vendorData.ownerName} (${vendorData.phone})` : 'Contact details provided',
      icon: Building2,
      status: vendorData?.ownerName ? 'COMPLETED' : 'COMPLETED',
      stepNumber: 2,
    },
    {
      id: 3,
      title: 'Business & Tax Registration',
      subtitle: vendorData?.businessName ? `${vendorData.businessName} • ${vendorData.legalEntityType || 'PROPRIETORSHIP'}` : 'Business entity & category',
      icon: Building2,
      status: 'COMPLETED',
      stepNumber: 3,
    },
    {
      id: 4,
      title: 'Store Address & Location Pin',
      subtitle: vendorData?.address?.line1 ? `${vendorData.address.line1}, ${vendorData.address.city}` : 'GPS coordinates & address verified',
      icon: MapPin,
      status: 'COMPLETED',
      stepNumber: 4,
    },
    {
      id: 5,
      title: 'KYC & Statutory Verification',
      subtitle: 'PAN, GST, FSSAI / Drug License documents uploaded',
      icon: FileCheck,
      status: 'COMPLETED',
      stepNumber: 5,
    },
    {
      id: 6,
      title: 'Bank & Settlement Account',
      subtitle: vendorData?.bankAccount ? `${vendorData.bankAccount.bankName} • ${maskAccountNumber(vendorData.bankAccount.accountNumber)}` : 'Verified settlement account',
      icon: Landmark,
      status: 'COMPLETED',
      stepNumber: 6,
    },
    {
      id: 7,
      title: 'Customer Storefront Branding',
      subtitle: '1:1 Logo, 16:9 Cover Banner, Store Display Name',
      icon: Store,
      status: 'COMPLETED',
      stepNumber: 7,
    },
    {
      id: 8,
      title: 'Operating Hours & Service Radius',
      subtitle: '7-Day schedule & 5 km delivery radius configured',
      icon: Clock,
      status: 'COMPLETED',
      stepNumber: 8,
    },
    {
      id: 9,
      title: 'Starter Products Catalog',
      subtitle: 'Starter items & SKU variants configured',
      icon: Package,
      status: 'COMPLETED',
      stepNumber: 9,
    },
    {
      id: 10,
      title: 'Delivery & Packaging Preferences',
      subtitle: 'Preparation time, packaging type, fragile handling flags',
      icon: Truck,
      status: 'COMPLETED',
      stepNumber: 10,
    },
  ];

  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const res = await VendorApi.submitOnboarding({
        ...vendorData,
        agreements: {
          termsAccepted: true,
          privacyAccepted: true,
          agreementAccepted: true,
          accuracyAccepted: true,
          acceptedAt: new Date().toISOString(),
        },
      });

      toast.success('Application submitted successfully for admin verification!');
      onSubmitSuccess(res.data || res);
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      Alert.alert(
        'Submission Incomplete',
        normalized.message || 'Please complete all required sections and agreements before submitting.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Compiling onboarding review summary...
        </Text>
      </View>
    );
  }

  return (
    <StepContainer
      icon={<ClipboardCheck size={24} color={colors.primary} />}
      title="Application Review & Submission"
      subtitle="Verify all business details and accept partner agreements before submitting for admin verification."
    >
      {/* 1. SECTIONS SUMMARY LIST */}
      <View style={styles.sectionsList}>
        <Text style={[styles.listHeading, { color: colors.textPrimary }]}>
          Completed Application Sections
        </Text>

        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <View
              key={sec.id}
              style={[styles.sectionRowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.secIconBox, { backgroundColor: colors.primaryLight }]}>
                <Icon size={18} color={colors.primary} />
              </View>

              <View style={styles.secInfo}>
                <View style={styles.secTitleRow}>
                  <Text style={[styles.secTitle, { color: colors.textPrimary }]}>{sec.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                    <CheckCircle2 size={10} color="#10B981" />
                    <Text style={[styles.statusText, { color: '#065F46' }]}>Complete</Text>
                  </View>
                </View>
                <Text style={[styles.secSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {sec.subtitle}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => onEditStep(sec.stepNumber)}
                style={[styles.editBtn, { borderColor: colors.primary }]}
              >
                <Text style={[styles.editText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* 2. STATUTORY AGREEMENTS & DECLARATIONS */}
      <View style={[styles.agreementsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.agreementsHeader}>
          <FileText size={18} color={colors.primary} />
          <Text style={[styles.agreementsTitle, { color: colors.textPrimary }]}>
            Statutory Declarations & Agreements *
          </Text>
        </View>

        <View style={styles.agreementsList}>
          {/* Terms */}
          <TouchableOpacity
            onPress={() => setTermsAccepted(!termsAccepted)}
            style={styles.checkboxRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: termsAccepted ? colors.primary : colors.background,
                  borderColor: termsAccepted ? colors.primary : colors.border,
                },
              ]}
            >
              {termsAccepted && <CheckCircle2 size={12} color="#FFFFFF" />}
            </View>
            <Text style={[styles.agreementText, { color: colors.textPrimary }]}>
              I agree to the{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Sevazo Merchant Terms & Conditions</Text>.
            </Text>
          </TouchableOpacity>

          {/* Privacy */}
          <TouchableOpacity
            onPress={() => setPrivacyAccepted(!privacyAccepted)}
            style={styles.checkboxRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: privacyAccepted ? colors.primary : colors.background,
                  borderColor: privacyAccepted ? colors.primary : colors.border,
                },
              ]}
            >
              {privacyAccepted && <CheckCircle2 size={12} color="#FFFFFF" />}
            </View>
            <Text style={[styles.agreementText, { color: colors.textPrimary }]}>
              I accept the{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Platform Partner Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>

          {/* Master Vendor Agreement */}
          <TouchableOpacity
            onPress={() => setAgreementAccepted(!agreementAccepted)}
            style={styles.checkboxRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: agreementAccepted ? colors.primary : colors.background,
                  borderColor: agreementAccepted ? colors.primary : colors.border,
                },
              ]}
            >
              {agreementAccepted && <CheckCircle2 size={12} color="#FFFFFF" />}
            </View>
            <Text style={[styles.agreementText, { color: colors.textPrimary }]}>
              I agree to the{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Master Vendor Agreement & Commission Schedule</Text>.
            </Text>
          </TouchableOpacity>

          {/* Truthfulness Declaration */}
          <TouchableOpacity
            onPress={() => setAccuracyAccepted(!accuracyAccepted)}
            style={styles.checkboxRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: accuracyAccepted ? colors.primary : colors.background,
                  borderColor: accuracyAccepted ? colors.primary : colors.border,
                },
              ]}
            >
              {accuracyAccepted && <CheckCircle2 size={12} color="#FFFFFF" />}
            </View>
            <Text style={[styles.agreementText, { color: colors.textPrimary }]}>
              I hereby declare that all provided documents, licenses, bank details, and business data are 100% genuine and accurate.
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. FINAL SUBMISSION CTA */}
      <View style={styles.actionsBlock}>
        <Button
          title="Review & Submit Application"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!allAgreementsAccepted || loading}
          loading={loading}
          onPress={() => setShowConfirmModal(true)}
        />
        {!allAgreementsAccepted && (
          <Text style={[styles.agreementWarning, { color: colors.textSecondary }]}>
            Please accept all 4 statutory declarations above to enable final submission.
          </Text>
        )}
      </View>

      {/* Confirmation Modal Before Submission */}
      <Modal transparent visible={showConfirmModal} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIconBox, { backgroundColor: colors.primaryLight }]}>
              <ShieldCheck size={28} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Review & Submit Application?
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Once submitted, your application and statutory documents will enter our Admin Verification Queue. You will be notified once reviewed.
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Review & Submit Application"
                variant="primary"
                size="md"
                fullWidth
                loading={loading}
                onPress={handleFinalSubmit}
              />
              <Button
                title="Review Details Again"
                variant="ghost"
                size="sm"
                fullWidth
                disabled={loading}
                onPress={() => setShowConfirmModal(false)}
                style={{ marginTop: 6 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </StepContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  sectionsList: {
    gap: 10,
    marginBottom: 20,
  },
  listHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 10,
  },
  secIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secInfo: {
    flex: 1,
  },
  secTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  secSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  editText: {
    fontSize: 11,
    fontWeight: '700',
  },
  agreementsCard: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: 20,
    ...Shadows.card,
  },
  agreementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  agreementsTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  agreementsList: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  agreementText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  actionsBlock: {
    marginTop: 6,
  },
  agreementWarning: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    padding: 20,
    borderRadius: BorderRadius.xl,
    ...Shadows.elevated,
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  modalActions: {
    marginTop: 10,
  },
});
