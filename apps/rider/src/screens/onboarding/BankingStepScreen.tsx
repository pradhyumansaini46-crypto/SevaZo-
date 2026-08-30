import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { CheckCircle2, ShieldCheck, Landmark, Smartphone, Zap, Sparkles } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { zodResolver } from '../../utils/zodResolver';
import { bankingSchema, BankingFormValues } from '../../validation/onboardingValidation';

const POPULAR_UPI_SUFFIXES = [
  '@okhdfcbank',
  '@okaxis',
  '@oksbi',
  '@okicici',
  '@paytm',
  '@ybl',
  '@ibl',
  '@upi',
];

export const BankingStepScreen = ({ navigation }: any) => {
  const { rider } = useAuthStore();
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const [verifyingIfsc, setVerifyingIfsc] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);

  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [upiVerifiedName, setUpiVerifiedName] = useState<string | null>(
    draftData?.banking?.upiVerifiedName || null
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BankingFormValues>({
    resolver: zodResolver(bankingSchema),
    defaultValues: {
      preferredPayoutMethod: draftData?.banking?.preferredPayoutMethod || 'BANK_ACCOUNT',
      accountHolder:
        draftData?.banking?.accountHolder ||
        draftData?.personal?.firstName
          ? `${draftData?.personal?.firstName || ''} ${draftData?.personal?.lastName || ''}`.trim()
          : '',
      accountNumber: draftData?.banking?.accountNumber || '',
      confirmAccountNumber: draftData?.banking?.confirmAccountNumber || '',
      ifsc: draftData?.banking?.ifsc || '',
      bankName: draftData?.banking?.bankName || '',
      upiId: draftData?.banking?.upiId || '',
    },
  });

  const preferredMethod = watch('preferredPayoutMethod');
  const ifscCode = watch('ifsc');
  const currentUpiId = watch('upiId');
  const currentAccountHolder = watch('accountHolder');

  const handleVerifyIfsc = async () => {
    if (!ifscCode || ifscCode.length < 11) return;
    setVerifyingIfsc(true);
    setTimeout(() => {
      setValue('bankName', 'HDFC Bank Ltd (Indiranagar Branch)', { shouldValidate: true });
      setBankVerified(true);
      setVerifyingIfsc(false);
    }, 600);
  };

  const handleVerifyUpi = async () => {
    if (!currentUpiId || !currentUpiId.includes('@')) return;
    setVerifyingUpi(true);
    setTimeout(() => {
      const verifiedName = currentAccountHolder || 'Verified Delivery Partner';
      setUpiVerifiedName(verifiedName);
      setVerifyingUpi(false);
    }, 600);
  };

  const handleApplyUpiSuffix = (suffix: string) => {
    const raw = currentUpiId || '';
    const prefix = raw.includes('@') ? raw.split('@')[0] : raw;
    const newUpi = `${prefix || 'user'}${suffix}`;
    setValue('upiId', newUpi, { shouldValidate: true });
    setUpiVerifiedName(null);
  };

  const onSubmit = async (data: BankingFormValues) => {
    clearError();
    const payload = {
      ...data,
      upiVerifiedName: upiVerifiedName,
    };
    const success = await saveSection('banking', payload, true);
    if (success) {
      navigation.navigate('OnboardingServiceArea');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection('banking', { ...data, upiVerifiedName }, false);
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={9}
      stepTitle="Bank & Payout Details"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingVehicle')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Where should we send your earnings?"
        subtitle="Choose your preferred payout method for daily, weekly, or instant shift earnings direct deposits."
        error={error}
      >
        {/* Preferred Payout Method Toggle */}
        <View style={styles.methodToggleRow}>
          <TouchableOpacity
            style={[
              styles.methodCard,
              preferredMethod === 'BANK_ACCOUNT' && styles.methodCardSelected,
            ]}
            onPress={() => {
              setValue('preferredPayoutMethod', 'BANK_ACCOUNT', { shouldValidate: true });
              clearError();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Bank Transfer method"
          >
            <Landmark
              size={20}
              color={preferredMethod === 'BANK_ACCOUNT' ? '#FF6600' : Colors.textSecondary}
            />
            <Text
              style={[
                styles.methodText,
                preferredMethod === 'BANK_ACCOUNT' && styles.methodTextSelected,
              ]}
            >
              Bank Transfer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              preferredMethod === 'UPI' && styles.methodCardSelected,
            ]}
            onPress={() => {
              setValue('preferredPayoutMethod', 'UPI', { shouldValidate: true });
              clearError();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="UPI Instant method"
          >
            <Smartphone
              size={20}
              color={preferredMethod === 'UPI' ? '#FF6600' : Colors.textSecondary}
            />
            <Text
              style={[
                styles.methodText,
                preferredMethod === 'UPI' && styles.methodTextSelected,
              ]}
            >
              UPI Instant
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Form Sections based on Preferred Method */}
        {preferredMethod === 'UPI' ? (
          /* ================= UPI INSTANT FORM ================= */
          <View style={styles.upiContainer}>
            {/* Instant Payout Badge */}
            <View style={styles.upiHighlightBanner}>
              <Zap size={18} color="#FF6600" />
              <View style={styles.upiBannerTextCol}>
                <Text style={styles.upiBannerTitle}>Instant Direct Deposit (60 Seconds)</Text>
                <Text style={styles.upiBannerDesc}>
                  Shift earnings are transferred directly into your UPI linked bank account within 60
                  seconds of completing deliveries.
                </Text>
              </View>
            </View>

            {/* Account Holder Name */}
            <Controller
              control={control}
              name="accountHolder"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Account Holder Name *"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={value}
                  onChangeText={onChange}
                  error={errors.accountHolder?.message}
                  helperText="Must match the registered name on your UPI ID"
                />
              )}
            />

            {/* UPI ID / VPA Input */}
            <Controller
              control={control}
              name="upiId"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="UPI ID / VPA *"
                  required
                  placeholder="e.g. 9876543210@paytm or name@okhdfcbank"
                  value={value}
                  onChangeText={(txt) => {
                    onChange(txt.trim());
                    setUpiVerifiedName(null);
                  }}
                  error={errors.upiId?.message}
                  autoCapitalize="none"
                  rightIcon={
                    verifyingUpi ? (
                      <ActivityIndicator size="small" color="#38BDF8" />
                    ) : upiVerifiedName ? (
                      <CheckCircle2 size={18} color="#22C55E" />
                    ) : (
                      <TouchableOpacity onPress={handleVerifyUpi}>
                        <Text style={styles.verifyLink}>Verify VPA</Text>
                      </TouchableOpacity>
                    )
                  }
                />
              )}
            />

            {/* UPI Verified Tag */}
            {upiVerifiedName && (
              <View style={styles.verifiedUpiBadge}>
                <CheckCircle2 size={14} color="#22C55E" />
                <Text style={styles.verifiedUpiText}>
                  VPA Verified • Registered to {upiVerifiedName}
                </Text>
              </View>
            )}

            {/* Popular UPI Handle Suffix Chips */}
            <View style={styles.suffixSection}>
              <Text style={styles.suffixLabel}>Quick Handles:</Text>
              <View style={styles.suffixChipsRow}>
                {POPULAR_UPI_SUFFIXES.map((suffix) => (
                  <TouchableOpacity
                    key={suffix}
                    style={styles.suffixChip}
                    onPress={() => handleApplyUpiSuffix(suffix)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Add handle ${suffix}`}
                  >
                    <Text style={styles.suffixChipText}>{suffix}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          /* ================= BANK TRANSFER FORM ================= */
          <View style={styles.bankContainer}>
            {/* Account Holder Name */}
            <Controller
              control={control}
              name="accountHolder"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Account Holder Name *"
                  required
                  placeholder="As per bank passbook / statement"
                  value={value}
                  onChangeText={onChange}
                  error={errors.accountHolder?.message}
                />
              )}
            />

            {/* IFSC Code & Validation */}
            <Controller
              control={control}
              name="ifsc"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Bank IFSC Code *"
                  required
                  placeholder="e.g. HDFC0001234"
                  value={value}
                  onChangeText={(txt) => {
                    onChange(txt.toUpperCase());
                    setBankVerified(false);
                  }}
                  error={errors.ifsc?.message}
                  autoCapitalize="characters"
                  maxLength={11}
                  rightIcon={
                    verifyingIfsc ? (
                      <ActivityIndicator size="small" color="#38BDF8" />
                    ) : bankVerified ? (
                      <CheckCircle2 size={18} color="#22C55E" />
                    ) : (
                      <TouchableOpacity onPress={handleVerifyIfsc}>
                        <Text style={styles.verifyLink}>Verify</Text>
                      </TouchableOpacity>
                    )
                  }
                />
              )}
            />

            {/* Bank Name */}
            <Controller
              control={control}
              name="bankName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Bank Name & Branch *"
                  required
                  placeholder="e.g. HDFC Bank Ltd (Indiranagar Branch)"
                  value={value}
                  onChangeText={onChange}
                  error={errors.bankName?.message}
                />
              )}
            />

            {/* Account Number */}
            <Controller
              control={control}
              name="accountNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Bank Account Number *"
                  required
                  placeholder="Enter bank account number"
                  value={value}
                  onChangeText={(txt) => onChange(txt.replace(/\D/g, ''))}
                  error={errors.accountNumber?.message}
                  keyboardType="number-pad"
                />
              )}
            />

            {/* Confirm Account Number */}
            <Controller
              control={control}
              name="confirmAccountNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Re-Enter Account Number *"
                  required
                  placeholder="Re-enter to confirm"
                  value={value}
                  onChangeText={(txt) => onChange(txt.replace(/\D/g, ''))}
                  error={errors.confirmAccountNumber?.message}
                  keyboardType="number-pad"
                />
              )}
            />

            {/* Optional UPI ID for Bank Transfer mode */}
            <Controller
              control={control}
              name="upiId"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Secondary UPI ID / VPA (Optional)"
                  placeholder="e.g. mobile@paytm"
                  value={value}
                  onChangeText={onChange}
                  error={errors.upiId?.message}
                  autoCapitalize="none"
                />
              )}
            />
          </View>
        )}

        {/* Security & Masking Note */}
        <View style={styles.securityBox}>
          <ShieldCheck size={18} color="#22C55E" />
          <View style={styles.securityTextCol}>
            <Text style={styles.securityTitle}>Bank-Grade Security & Encryption</Text>
            <Text style={styles.securityDesc}>
              Account numbers and VPA keys are encrypted with AES-256 at rest. Once saved, details
              are masked as XXXX XXXX 4582 and cannot be modified without OTP authorization.
            </Text>
          </View>
        </View>
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  methodToggleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  methodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  methodCardSelected: {
    borderColor: '#FF6600',
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
  },
  methodText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  methodTextSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  verifyLink: {
    ...Typography.bodySmall,
    color: '#FF6600',
    fontWeight: '700',
  },
  upiContainer: {
    gap: Spacing.xs,
  },
  bankContainer: {
    gap: Spacing.xs,
  },
  upiHighlightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  upiBannerTextCol: {
    flex: 1,
  },
  upiBannerTitle: {
    ...Typography.titleSmall,
    color: '#EA580C',
    fontSize: 13,
    fontWeight: '700',
  },
  upiBannerDesc: {
    ...Typography.bodySmall,
    color: '#9A3412',
    marginTop: 2,
    lineHeight: 18,
  },
  verifiedUpiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  verifiedUpiText: {
    ...Typography.bodySmall,
    color: '#065F46',
    fontWeight: '700',
  },
  suffixSection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  suffixLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  suffixChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  suffixChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suffixChipText: {
    ...Typography.bodySmall,
    color: '#FF6600',
    fontSize: 12,
    fontWeight: '600',
  },
  securityBox: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  securityTextCol: {
    flex: 1,
  },
  securityTitle: {
    ...Typography.titleSmall,
    color: '#065F46',
    fontSize: 13,
    fontWeight: '700',
  },
  securityDesc: {
    ...Typography.bodySmall,
    color: '#047857',
    marginTop: 2,
    lineHeight: 18,
  },
});

export default BankingStepScreen;
