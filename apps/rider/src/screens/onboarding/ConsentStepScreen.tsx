import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { ShieldCheck, FileCheck, CheckCircle2, AlertTriangle, Scale, Lock, UserCheck } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { zodResolver } from '../../utils/zodResolver';
import { consentSchema, ConsentFormValues } from '../../validation/onboardingValidation';

export const ConsentStepScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const applicantLegalName =
    draftData?.personal?.firstName && draftData?.personal?.lastName
      ? `${draftData.personal.firstName} ${draftData.personal.lastName}`
      : draftData?.banking?.accountHolder || '';

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConsentFormValues>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      codeOfConductAgreed: draftData?.consent?.codeOfConductAgreed ?? true,
      safetyGuidelinesAgreed: draftData?.consent?.safetyGuidelinesAgreed ?? true,
      zeroTolerancePolicyAgreed: draftData?.consent?.zeroTolerancePolicyAgreed ?? true,
      backgroundCheckAgreed: draftData?.consent?.backgroundCheckAgreed ?? true,
      dataConsentAgreed: draftData?.consent?.dataConsentAgreed ?? true,
      declarationConfirmed: draftData?.consent?.declarationConfirmed ?? true,
      signatureName: draftData?.consent?.signatureName || applicantLegalName || '',
    },
  });

  const onSubmit = async (data: ConsentFormValues) => {
    clearError();
    const payload = {
      ...data,
      signedAt: new Date().toISOString(),
    };
    const success = await saveSection('consent', payload, true);
    if (success) {
      // Navigate to Review Screen
      navigation.navigate('OnboardingReview');
    }
  };

  return (
    <OnboardingLayout
      currentStep={8}
      totalSteps={8}
      stepTitle="Consent & Declaration"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingAvailability')}
      onSaveContinue={handleSubmit(onSubmit)}
      isLoading={isSaving}
    >
      <StepContainer
        title="Rider Consent & Undertaking"
        subtitle="Please review and accept mandatory partner safety policies, code of conduct, and terms."
        error={error}
      >
        {/* Top Assurance Banner */}
        <View style={styles.assuranceBanner}>
          <ShieldCheck size={24} color="#10B981" />
          <View style={styles.assuranceTextCol}>
            <Text style={styles.assuranceTitle}>Official Fleet Partner Undertaking</Text>
            <Text style={styles.assuranceDesc}>
              SevaZo prioritizes road safety, partner welfare, zero harassment, and strict compliance with Indian Motor Vehicles regulations.
            </Text>
          </View>
        </View>

        {/* 1. Code of Conduct */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Scale size={20} color="#FF6600" />
            <Text style={styles.policyTitle}>1. Partner Code of Conduct</Text>
          </View>
          <Text style={styles.policyText}>
            • Treat all customers, merchant store staff, and fellow riders with dignity, courtesy, and respect.{"\n"}
            • Never solicit tips, misuse customer phone numbers, or disclose private delivery details.{"\n"}
            • Handle merchant merchandise with utmost care and hygienic safety.
          </Text>
          <View style={styles.checkboxRow}>
            <Controller
              control={control}
              name="codeOfConductAgreed"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor={value ? '#FFFFFF' : '#94A3B8'}
                />
              )}
            />
            <Text style={styles.checkboxLabel}>I agree to abide by the Rider Code of Conduct</Text>
          </View>
          {errors.codeOfConductAgreed && (
            <Text style={styles.errorText}>{errors.codeOfConductAgreed.message}</Text>
          )}
        </View>

        {/* 2. Road Safety & Traffic Rules */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <AlertTriangle size={20} color="#FF6600" />
            <Text style={styles.policyTitle}>2. Road Safety & Gear Undertaking</Text>
          </View>
          <Text style={styles.policyText}>
            • Mandatory ISI-marked helmet wear at all times while online on shift.{"\n"}
            • Strict compliance with traffic lights, speed limits, and one-way guidelines.{"\n"}
            • Maintenance of valid vehicle insurance, registration, and active brakes/lights.
          </Text>
          <View style={styles.checkboxRow}>
            <Controller
              control={control}
              name="safetyGuidelinesAgreed"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor={value ? '#FFFFFF' : '#94A3B8'}
                />
              )}
            />
            <Text style={styles.checkboxLabel}>I commit to road safety and gear compliance</Text>
          </View>
          {errors.safetyGuidelinesAgreed && (
            <Text style={styles.errorText}>{errors.safetyGuidelinesAgreed.message}</Text>
          )}
        </View>

        {/* 3. Zero Tolerance Policy */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Lock size={20} color="#EF4444" />
            <Text style={styles.policyTitle}>3. Zero Tolerance Policy</Text>
          </View>
          <Text style={styles.policyText}>
            • Strict zero tolerance for alcohol, narcotic substance abuse, or riding under the influence.{"\n"}
            • Zero tolerance for sexual harassment, verbal misconduct, or physical violence. Immediate platform offboarding and legal escalation applies.
          </Text>
          <View style={styles.checkboxRow}>
            <Controller
              control={control}
              name="zeroTolerancePolicyAgreed"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor={value ? '#FFFFFF' : '#94A3B8'}
                />
              )}
            />
            <Text style={styles.checkboxLabel}>I accept the Zero Tolerance Policy</Text>
          </View>
          {errors.zeroTolerancePolicyAgreed && (
            <Text style={styles.errorText}>{errors.zeroTolerancePolicyAgreed.message}</Text>
          )}
        </View>

        {/* 4. Background Verification & Data Privacy */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <UserCheck size={20} color="#FF6600" />
            <Text style={styles.policyTitle}>4. Background Verification & Location Consent</Text>
          </View>
          <Text style={styles.policyText}>
            • I authorize SevaZo and its authorized verification partners to conduct identity, criminal record, and driving licence checks.{"\n"}
            • I consent to GPS background location tracking during active online shifts for order dispatch and SOS emergency support.
          </Text>
          <View style={styles.checkboxRow}>
            <Controller
              control={control}
              name="backgroundCheckAgreed"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor={value ? '#FFFFFF' : '#94A3B8'}
                />
              )}
            />
            <Text style={styles.checkboxLabel}>I consent to background check & GPS location</Text>
          </View>
          {errors.backgroundCheckAgreed && (
            <Text style={styles.errorText}>{errors.backgroundCheckAgreed.message}</Text>
          )}
        </View>

        {/* 5. Legal Confirmation & Digital Signature */}
        <View style={styles.signatureCard}>
          <View style={styles.policyHeader}>
            <FileCheck size={20} color="#10B981" />
            <Text style={styles.signatureTitle}>5. Digital Declaration & Legal Signature *</Text>
          </View>

          <Text style={styles.declarationStatement}>
            "I hereby declare that all information, documents, and driving credentials submitted by me are authentic, valid, and true to my knowledge. I understand that misrepresentation will lead to instant termination."
          </Text>

          <View style={styles.checkboxRow}>
            <Controller
              control={control}
              name="declarationConfirmed"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor={value ? '#FFFFFF' : '#94A3B8'}
                />
              )}
            />
            <Text style={styles.checkboxLabel}>I solemnly declare that all information is true</Text>
          </View>
          {errors.declarationConfirmed && (
            <Text style={styles.errorText}>{errors.declarationConfirmed.message}</Text>
          )}

          {/* Signature Input */}
          <View style={styles.signatureInputContainer}>
            <Controller
              control={control}
              name="signatureName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Digital Signature (Type Full Legal Name)"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={value}
                  onChangeText={onChange}
                  error={errors.signatureName?.message}
                  helperText="Serves as legally binding electronic signature under IT Act, 2000."
                />
              )}
            />
          </View>
        </View>
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  assuranceBanner: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  assuranceTextCol: {
    flex: 1,
  },
  assuranceTitle: {
    ...Typography.titleSmall,
    color: '#065F46',
    fontWeight: '800',
    fontSize: 14,
  },
  assuranceDesc: {
    ...Typography.bodySmall,
    color: '#047857',
    marginTop: 2,
    lineHeight: 18,
    fontSize: 12,
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: 2,
  },
  policyTitle: {
    ...Typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },
  policyText: {
    ...Typography.bodySmall,
    color: '#475569',
    lineHeight: 20,
    fontSize: 12.5,
    backgroundColor: '#F8FAFC',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  checkboxLabel: {
    ...Typography.bodyMedium,
    color: '#1E293B',
    fontWeight: '700',
    flex: 1,
    fontSize: 13.5,
  },
  signatureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: '#FED7AA',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  signatureTitle: {
    ...Typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 16,
  },
  declarationStatement: {
    ...Typography.bodySmall,
    color: '#9A3412',
    fontStyle: 'italic',
    lineHeight: 19,
    backgroundColor: '#FFF7ED',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  signatureInputContainer: {
    marginTop: Spacing.xs,
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    fontSize: 11,
  },
});

export default ConsentStepScreen;
