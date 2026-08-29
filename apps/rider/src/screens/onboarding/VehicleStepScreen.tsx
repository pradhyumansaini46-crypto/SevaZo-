import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Bike, Car as CarIcon, Sparkles } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { zodResolver } from '../../utils/zodResolver';
import { vehicleSchema, VehicleFormValues } from '../../validation/onboardingValidation';

const VEHICLE_TYPES = [
  { label: '🏍 Motorcycle', value: 'MOTORCYCLE' },
  { label: '🛵 Scooter', value: 'SCOOTER' },
  { label: '🚲 Bicycle', value: 'BICYCLE' },
  { label: '🚗 Car', value: 'CAR' },
  { label: '🛺 Other', value: 'OTHER' },
] as const;

const OWNERSHIP_TYPES = [
  { label: 'Owned', value: 'OWNED' },
  { label: 'Family', value: 'FAMILY' },
  { label: 'Rented', value: 'RENTED' },
  { label: 'Company', value: 'COMPANY' },
] as const;

export const VehicleStepScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleType: draftData?.vehicle?.vehicleType || 'MOTORCYCLE',
      ownershipType: draftData?.vehicle?.ownershipType || 'OWNED',
      make: draftData?.vehicle?.make || '',
      model: draftData?.vehicle?.model || '',
      manufacturingYear: draftData?.vehicle?.manufacturingYear || '',
      color: draftData?.vehicle?.color || '',
      registrationNumber: draftData?.vehicle?.registrationNumber || '',
      bicycleType: draftData?.vehicle?.bicycleType || 'STANDARD',
      bicycleBrand: draftData?.vehicle?.bicycleBrand || '',
      bicycleModel: draftData?.vehicle?.bicycleModel || '',
    },
  });

  const selectedVehicleType = watch('vehicleType');
  const selectedOwnership = watch('ownershipType');
  const isBicycle = selectedVehicleType === 'BICYCLE';

  const onSubmit = async (data: VehicleFormValues) => {
    clearError();
    const success = await saveSection('vehicle', data, true);
    if (success) {
      navigation.navigate('OnboardingIdentity');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection('vehicle', data, false);
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={14}
      stepTitle="Vehicle Registration"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingEmergencyContact')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Vehicle Information"
        subtitle="Select your delivery vehicle mode and provide vehicle registration details."
        error={error}
      >
        {/* Vehicle Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>How will you deliver? *</Text>
          <View style={styles.chipsGrid}>
            {VEHICLE_TYPES.map((v) => (
              <TouchableOpacity
                key={v.value}
                style={[
                  styles.vehicleChip,
                  selectedVehicleType === v.value && styles.vehicleChipSelected,
                ]}
                onPress={() => setValue('vehicleType', v.value, { shouldValidate: true })}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Vehicle type: ${v.label}`}
              >
                <Text
                  style={[
                    styles.vehicleChipText,
                    selectedVehicleType === v.value && styles.vehicleChipTextSelected,
                  ]}
                >
                  {v.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ownership Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Vehicle Ownership *</Text>
          <View style={styles.chipsRow}>
            {OWNERSHIP_TYPES.map((o) => (
              <TouchableOpacity
                key={o.value}
                style={[
                  styles.ownershipChip,
                  selectedOwnership === o.value && styles.ownershipChipSelected,
                ]}
                onPress={() => setValue('ownershipType', o.value, { shouldValidate: true })}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Ownership: ${o.label}`}
              >
                <Text
                  style={[
                    styles.ownershipChipText,
                    selectedOwnership === o.value && styles.ownershipChipTextSelected,
                  ]}
                >
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dynamic Fields: Motor Vehicle vs Bicycle */}
        {!isBicycle ? (
          <>
            <View style={styles.row}>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="make"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Vehicle Make"
                      required
                      placeholder="e.g. Honda, Bajaj, TVS"
                      value={value}
                      onChangeText={onChange}
                      error={errors.make?.message}
                    />
                  )}
                />
              </View>

              <View style={styles.col}>
                <Controller
                  control={control}
                  name="model"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Model"
                      required
                      placeholder="e.g. Activa, Pulsar"
                      value={value}
                      onChangeText={onChange}
                      error={errors.model?.message}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="manufacturingYear"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Mfg. Year"
                      required
                      placeholder="e.g. 2022"
                      value={value}
                      onChangeText={onChange}
                      error={errors.manufacturingYear?.message}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                  )}
                />
              </View>

              <View style={styles.col}>
                <Controller
                  control={control}
                  name="color"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Vehicle Color"
                      required
                      placeholder="e.g. Black, Red"
                      value={value}
                      onChangeText={onChange}
                      error={errors.color?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="registrationNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Registration Number"
                  required
                  placeholder="e.g. DL 01 AB 1234"
                  value={value}
                  onChangeText={(txt) => onChange(txt.toUpperCase())}
                  error={errors.registrationNumber?.message}
                  autoCapitalize="characters"
                  helperText="As printed on your Vehicle Registration Certificate (RC)"
                />
              )}
            />
          </>
        ) : (
          <>
            <View style={styles.bicycleNotice}>
              <Sparkles size={16} color="#FF6600" />
              <Text style={styles.bicycleNoticeText}>
                Eco-Friendly Delivery: No driving licence or RC certificate required for bicycle
                delivery partners!
              </Text>
            </View>

            <Controller
              control={control}
              name="bicycleBrand"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Bicycle Brand"
                  required
                  placeholder="e.g. Hero, Firefox, Trek, Decathlon"
                  value={value}
                  onChangeText={onChange}
                  error={errors.bicycleBrand?.message}
                />
              )}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="bicycleModel"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Model (Optional)"
                      placeholder="e.g. Sprint, Rockrider"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>

              <View style={styles.col}>
                <Controller
                  control={control}
                  name="color"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Bicycle Color"
                      required
                      placeholder="e.g. Blue, Black"
                      value={value}
                      onChangeText={onChange}
                      error={errors.color?.message}
                    />
                  )}
                />
              </View>
            </View>
          </>
        )}
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  vehicleChip: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  vehicleChipSelected: {
    borderColor: '#FF6600',
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
  },
  vehicleChipText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  vehicleChipTextSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ownershipChip: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  ownershipChipSelected: {
    borderColor: '#FF6600',
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
  },
  ownershipChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  ownershipChipTextSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  bicycleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  bicycleNoticeText: {
    ...Typography.bodySmall,
    color: '#9A3412',
    flex: 1,
    lineHeight: 18,
  },
});

export default VehicleStepScreen;
