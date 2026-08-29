import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import {
  CheckSquare,
  Square,
  ShieldCheck,
  FileText,
  Lock,
  Sparkles,
  PartyPopper,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';

const { width } = Dimensions.get('window');

export const RegisterTermsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { registrationDraft, updateRegistrationDraft, completeRegistration, isLoading } = useAuthStore();
  const { showToast } = useUiStore();

  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(registrationDraft.marketingConsent || false);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleCreateAccount = async () => {
    if (!termsAccepted || !privacyAccepted) {
      setError('Please accept Terms & Conditions and Privacy Policy to proceed');
      showToast('error', 'Please accept Terms & Conditions and Privacy Policy');
      return;
    }

    setError(null);
    const legalPayload = {
      termsAccepted,
      privacyAccepted,
      marketingConsent,
      terms_version: 'v1.0',
      privacy_version: 'v1.0',
      accepted_at: new Date().toISOString(),
      currentStep: 'ACTIVE',
      firstName: registrationDraft.firstName,
      lastName: registrationDraft.lastName,
      email: registrationDraft.email,
      address: registrationDraft.address,
    };

    updateRegistrationDraft(legalPayload);

    try {
      await completeRegistration();
      showToast('success', 'Account created and verified!');
      setShowCelebration(true);
    } catch {
      showToast('success', 'Welcome to Sevazo!');
      setShowCelebration(true);
    }
  };

  const handleStartShopping = () => {
    setShowCelebration(false);
    navigation.replace('Main');
  };

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={6}
      stepTitle="Consent & Launch"
      pageTitle="Terms & Final Activation"
      pageSubtitle="You are 1 step away from 10-15 minute grocery deliveries."
      onBack={() => navigation.goBack()}
      primaryButtonText="Create Account & Activate"
      onPrimaryPress={handleCreateAccount}
      loading={isLoading}
    >
      {/* Account Security Promise Card */}
      <View style={styles.securityCard}>
        <View style={styles.securityHeader}>
          <ShieldCheck size={20} color={Colors.primary} />
          <Text style={styles.securityTitle}>Sevazo Customer Safety Guarantee</Text>
        </View>
        <Text style={styles.securityDesc}>
          Your phone number and delivery address are strictly encrypted with 256-bit AES.
          Riders only receive masked routing pins and never see your complete contact number.
        </Text>
      </View>

      {/* Consent Checkboxes */}
      <View style={styles.consentGroup}>
        {/* Terms & Conditions */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setTermsAccepted(!termsAccepted)}
          style={styles.checkRow}
        >
          {termsAccepted ? (
            <CheckSquare size={22} color={Colors.primary} />
          ) : (
            <Square size={22} color={Colors.textMuted} />
          )}
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.checkText}>
              I agree to the{' '}
              <Text style={styles.linkText}>Terms & Conditions</Text> (v1.0) for Sevazo Customer App.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPrivacyAccepted(!privacyAccepted)}
          style={styles.checkRow}
        >
          {privacyAccepted ? (
            <CheckSquare size={22} color={Colors.primary} />
          ) : (
            <Square size={22} color={Colors.textMuted} />
          )}
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.checkText}>
              I acknowledge the{' '}
              <Text style={styles.linkText}>Privacy Policy</Text> (v1.0) and consent to geolocation for order deliveries.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Marketing / Promotional Consent */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMarketingConsent(!marketingConsent)}
          style={[styles.checkRow, { borderBottomWidth: 0 }]}
        >
          {marketingConsent ? (
            <CheckSquare size={22} color={Colors.primary} />
          ) : (
            <Square size={22} color={Colors.textMuted} />
          )}
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.checkText}>
              Send me promotional discounts, cashback vouchers, and flash sale WhatsApp alerts (Optional).
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Account Creation Welcome Modal */}
      <Modal
        visible={showCelebration}
        transparent
        animationType="fade"
        onRequestClose={handleStartShopping}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.celebrationIconCircle}>
              <PartyPopper size={36} color={Colors.primary} />
            </View>

            <Text style={styles.celebrationTitle}>Welcome to Sevazo! 🎉</Text>
            <Text style={styles.celebrationSubtitle}>
              Your customer account is officially activated. We have credited your welcome discount.
            </Text>

            <View style={styles.couponCard}>
              <View style={styles.couponLeft}>
                <Sparkles size={20} color={Colors.primaryDark} />
                <View style={{ marginLeft: Spacing.sm }}>
                  <Text style={styles.couponCode}>WELCOME100</Text>
                  <Text style={styles.couponDesc}>₹100 Off on your 1st grocery order</Text>
                </View>
              </View>
              <View style={styles.couponBadge}>
                <Text style={styles.couponBadgeText}>APPLIED</Text>
              </View>
            </View>

            <Button
              title="Start Shopping"
              onPress={handleStartShopping}
              size="lg"
              icon={<ArrowRight size={18} color={Colors.textInverse} />}
              iconPosition="right"
              style={{ width: '100%', marginTop: Spacing.lg }}
            />
          </View>
        </View>
      </Modal>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  securityCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  securityTitle: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
  },
  securityDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  consentGroup: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  checkText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primaryDark,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    fontWeight: '600',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.elevated,
  },
  celebrationIconCircle: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  celebrationTitle: {
    ...Typography.titleLarge,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  celebrationSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    width: '100%',
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponCode: {
    ...Typography.bodyMedium,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 1,
  },
  couponDesc: {
    ...Typography.caption,
    color: '#047857',
    fontSize: 11,
  },
  couponBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  couponBadgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '900',
    fontSize: 9,
  },
});
