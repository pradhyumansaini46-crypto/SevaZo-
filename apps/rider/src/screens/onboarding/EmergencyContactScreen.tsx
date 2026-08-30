import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '../../utils/zodResolver';
import { ShieldAlert, Lock, HeartHandshake } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { emergencyContactSchema, EmergencyContactFormValues } from '../../validation/onboardingValidation';

const RELATIONSHIPS = ['Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Friend', 'Other'] as const;

export const EmergencyContactScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmergencyContactFormValues>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      fullName: draftData?.emergencyContact?.fullName || '',
      relationship: draftData?.emergencyContact?.relationship || 'FATHER',
      mobileNumber: draftData?.emergencyContact?.mobileNumber || '',
    },
  });

  const selectedRelation = watch('relationship');

  const onSubmit = async (data: EmergencyContactFormValues) => {
    clearError();
    const success = await saveSection('emergency_contact', data, true);
    if (success) {
      navigation.navigate('OnboardingVehicle');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection('emergency_contact', data, false);
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={14}
      stepTitle="Emergency Contact"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingAddress')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Emergency Contact"
        subtitle="Nominate a trusted family member or emergency contact for on-road safety and SOS support."
        error={error}
      >
        {/* Strict Customer Privacy Protection Banner (Point 13 / Prompt 05) */}
        <View style={styles.privacyBanner}>
          <Lock size={18} color="#10B981" />
          <View style={styles.privacyTextContainer}>
            <Text style={styles.privacyTitle}>Strictly Confidential</Text>
            <Text style={styles.privacyDesc}>
              Do not worry — this information is strictly reserved for rider safety emergencies and
              is NEVER exposed to customers or vendors.
            </Text>
          </View>
        </View>

        {/* Contact Full Name */}
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Contact Full Name"
              required
              placeholder="e.g. Ramesh Sharma"
              value={value}
              onChangeText={onChange}
              error={errors.fullName?.message}
            />
          )}
        />

        {/* Quick Relationship Chips */}
        <View style={styles.relationContainer}>
          <Text style={styles.inputLabel}>Relationship *</Text>
          <View style={styles.chipsRow}>
            {RELATIONSHIPS.map((rel) => (
              <TouchableOpacity
                key={rel}
                style={[
                  styles.chip,
                  selectedRelation === rel && styles.chipSelected,
                ]}
                onPress={() => setValue('relationship', rel, { shouldValidate: true })}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Relationship: ${rel}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedRelation === rel && styles.chipTextSelected,
                  ]}
                >
                  {rel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.relationship && (
            <Text style={styles.errorText}>{errors.relationship.message}</Text>
          )}
        </View>

        {/* Contact Mobile Number */}
        <Controller
          control={control}
          name="mobileNumber"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Contact Mobile Number"
              required
              placeholder="10-digit number"
              value={value}
              onChangeText={(txt) => onChange(txt.replace(/\D/g, ''))}
              error={errors.mobileNumber?.message}
              keyboardType="phone-pad"
              maxLength={10}
              leftIcon={<Text style={styles.countryCode}>+91</Text>}
            />
          )}
        />

        <View style={styles.sosCard}>
          <HeartHandshake size={20} color="#FF6600" />
          <Text style={styles.sosText}>
            SevaZo 24/7 SOS dispatch center can reach this contact during road accidents or critical
            incidents.
          </Text>
        </View>
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    ...Typography.titleSmall,
    color: '#065F46',
    fontWeight: '700',
    fontSize: 13,
  },
  privacyDesc: {
    ...Typography.bodySmall,
    color: '#047857',
    marginTop: 2,
    lineHeight: 18,
  },
  relationContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  chipSelected: {
    borderColor: '#FF6600',
    backgroundColor: '#FFF7ED',
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  countryCode: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginRight: 4,
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    marginTop: 4,
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FFF7ED',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginTop: Spacing.md,
  },
  sosText: {
    ...Typography.bodySmall,
    color: '#9A3412',
    flex: 1,
    lineHeight: 18,
  },
});

export default EmergencyContactScreen;
