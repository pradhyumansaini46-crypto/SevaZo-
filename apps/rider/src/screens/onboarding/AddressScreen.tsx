import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '../../utils/zodResolver';
import { ShieldCheck } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { addressSchema, AddressFormValues } from '../../validation/onboardingValidation';

export const AddressScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressLine1: draftData?.address?.addressLine1 || '',
      addressLine2: draftData?.address?.addressLine2 || '',
      locality: draftData?.address?.locality || '',
      city: draftData?.address?.city || '',
      state: draftData?.address?.state || '',
      postalCode: draftData?.address?.postalCode || draftData?.address?.pincode || '',
      country: draftData?.address?.country || 'India',
    },
  });

  const onSubmit = async (data: AddressFormValues) => {
    clearError();
    const success = await saveSection('address', data, true);
    if (success) {
      // Step 3 is Identity Verification (comes before Vehicle)
      navigation.navigate('OnboardingIdentity');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection('address', data, false);
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={9}
      stepTitle="Residential Address"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingPersonal')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Residential Address"
        subtitle="Please enter your complete residential address manually. This is used for compliance and hub allocation."
        error={error}
      >
        {/* Address Line 1 */}
        <Controller
          control={control}
          name="addressLine1"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Address Line 1 (Flat / House No. / Building)"
              required
              placeholder="e.g. Flat 402, Sunshine Heights"
              value={value}
              onChangeText={onChange}
              error={errors.addressLine1?.message}
            />
          )}
        />

        {/* Address Line 2 */}
        <Controller
          control={control}
          name="addressLine2"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Address Line 2 (Street / Landmark)"
              placeholder="e.g. Near Indiranagar Metro Station"
              value={value}
              onChangeText={onChange}
              error={errors.addressLine2?.message}
            />
          )}
        />

        {/* Locality */}
        <Controller
          control={control}
          name="locality"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Locality / Area"
              required
              placeholder="e.g. Indiranagar"
              value={value}
              onChangeText={onChange}
              error={errors.locality?.message}
            />
          )}
        />

        {/* City & State */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="City"
                  required
                  placeholder="e.g. Jaipur"
                  value={value}
                  onChangeText={onChange}
                  error={errors.city?.message}
                />
              )}
            />
          </View>

          <View style={styles.col}>
            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="State"
                  required
                  placeholder="e.g. Rajasthan"
                  value={value}
                  onChangeText={onChange}
                  error={errors.state?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Postal Code & Country */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="postalCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Postal Code / PIN"
                  required
                  placeholder="e.g. 302021"
                  value={value}
                  onChangeText={onChange}
                  error={errors.postalCode?.message}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              )}
            />
          </View>

          <View style={styles.col}>
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Country"
                  placeholder="e.g. India"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.trustBadge}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustText}>
            Your residential location helps us match you with deliveries close to your home.
          </Text>
        </View>
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  trustText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
});

export default AddressScreen;
