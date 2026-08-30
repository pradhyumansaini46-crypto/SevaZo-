import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '../../utils/zodResolver';
import { FileText, Upload, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { ImagePickerModal } from '../../components/ImagePickerModal';
import { useOnboardingStore } from '../../store/onboardingStore';
import { vehicleSchema, VehicleFormValues } from '../../validation/onboardingValidation';

const VEHICLE_TYPES = [
  { label: 'Motorcycle / Bike', value: 'MOTORCYCLE' as const },
  { label: 'Scooter / Scooty', value: 'SCOOTER' as const },
  { label: 'Bicycle (Cycle)', value: 'BICYCLE' as const },
  { label: 'Car / Van', value: 'CAR' as const },
];

const OWNERSHIP_TYPES = [
  { label: 'Self Owned', value: 'OWNED' as const },
  { label: 'Family Owned', value: 'FAMILY' as const },
  { label: 'Rented / Leased', value: 'RENTED' as const },
  { label: 'Company Provided', value: 'COMPANY' as const },
];

export const VehicleStepScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const [activePickerDoc, setActivePickerDoc] = useState<'rc' | 'insurance' | 'puc' | null>(null);

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
      registrationNumber:
        draftData?.vehicle?.registrationNumber || draftData?.vehicleDocuments?.rcNumber || '',
      bicycleBrand: draftData?.vehicle?.bicycleBrand || '',
      bicycleModel: draftData?.vehicle?.bicycleModel || '',
      rcNumber:
        draftData?.vehicle?.rcNumber ||
        draftData?.vehicleDocuments?.rcNumber ||
        draftData?.vehicle?.registrationNumber ||
        '',
      rcImage: draftData?.vehicle?.rcImage || draftData?.vehicleDocuments?.rcImage || '',
      insuranceNumber:
        draftData?.vehicle?.insuranceNumber || draftData?.vehicleDocuments?.insuranceNumber || '',
      insuranceExpiry:
        draftData?.vehicle?.insuranceExpiry || draftData?.vehicleDocuments?.insuranceExpiry || '',
      insuranceImage:
        draftData?.vehicle?.insuranceImage || draftData?.vehicleDocuments?.insuranceImage || '',
      pucImage: draftData?.vehicle?.pucImage || draftData?.vehicleDocuments?.pucImage || '',
    },
  });

  const selectedVehicleType = watch('vehicleType');
  const selectedOwnership = watch('ownershipType');
  const isBicycle = selectedVehicleType === 'BICYCLE';

  const rcImage = watch('rcImage');
  const insuranceImage = watch('insuranceImage');
  const pucImage = watch('pucImage');

  const handleImagePicked = (uri: string) => {
    if (activePickerDoc === 'rc') {
      setValue('rcImage', uri, { shouldValidate: true });
    } else if (activePickerDoc === 'insurance') {
      setValue('insuranceImage', uri, { shouldValidate: true });
    } else if (activePickerDoc === 'puc') {
      setValue('pucImage', uri);
    }
    setActivePickerDoc(null);
  };

  const onSubmit = async (data: VehicleFormValues) => {
    clearError();
    const payload = {
      ...data,
      rcNumber: data.registrationNumber || data.rcNumber,
    };
    const success = await saveSection('vehicle', payload, true);
    if (success) {
      // Step 5 is Bank Account
      navigation.navigate('OnboardingBanking');
    }
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={8}
      stepTitle="Vehicle & Documents"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingIdentity')}
      onSaveContinue={handleSubmit(onSubmit)}
      isLoading={isSaving}
    >
      <StepContainer
        title="Vehicle & Compliance Details"
        subtitle="Provide your delivery vehicle information and compliance documents."
        error={error}
      >
        {/* Vehicle Type Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Vehicle Type *</Text>
          <View style={styles.chipsRow}>
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

        {/* Ownership Type Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Vehicle Ownership *</Text>
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

        {/* Bicycle Specific Form */}
        {isBicycle ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>Bicycle Details</Text>
            <Controller
              control={control}
              name="bicycleBrand"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Bicycle Brand / Manufacturer"
                  required
                  placeholder="e.g. Hero Cycles, Firefox, Trek"
                  value={value}
                  onChangeText={onChange}
                  error={errors.bicycleBrand?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="bicycleModel"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Bicycle Model (Optional)"
                  placeholder="e.g. Sprint Pro 26T"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="color"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Bicycle Color"
                  required
                  placeholder="e.g. Matte Black"
                  value={value}
                  onChangeText={onChange}
                  error={errors.color?.message}
                />
              )}
            />
          </View>
        ) : (
          /* Motor Vehicle Details Card */
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeaderTitle}>Vehicle Specifications</Text>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Controller
                    control={control}
                    name="make"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Make / Brand"
                        required
                        placeholder="e.g. Honda, Hero"
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
                        placeholder="e.g. Activa 6G, Splendor"
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
                        label="Manufacturing Year"
                        required
                        placeholder="e.g. 2022"
                        value={value}
                        onChangeText={(txt) => onChange(txt.replace(/\D/g, ''))}
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
                        placeholder="e.g. Red, Black"
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
                    label="Vehicle Registration Number"
                    required
                    placeholder="e.g. RJ 14 AB 1234"
                    value={value}
                    onChangeText={(txt) => {
                      const upper = txt.toUpperCase();
                      onChange(upper);
                      setValue('rcNumber', upper);
                    }}
                    error={errors.registrationNumber?.message}
                    autoCapitalize="characters"
                    helperText="Exact license plate registered with Regional Transport Office (RTO)."
                  />
                )}
              />
            </View>

            {/* Compliance Documents Header */}
            <View style={styles.sectionHeader}>
              <FileText size={22} color="#FF6600" />
              <Text style={styles.complianceHeaderTitle}>Vehicle Compliance Documents</Text>
            </View>

            {/* 1. Registration Certificate (RC) Card */}
            <View style={styles.complianceCard}>
              <Text style={styles.complianceCardTitle}>1. Registration Certificate (RC) *</Text>
              <Text style={styles.complianceCardSubtitle}>
                Upload clear scan/photo of the original RC book or smart card.
              </Text>

              <View style={styles.previewBox}>
                {rcImage ? (
                  <View style={styles.previewCard}>
                    <Image source={{ uri: rcImage }} style={styles.previewImage} />
                    <View style={styles.verifiedTag}>
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text style={styles.verifiedTagText}>RC Uploaded</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.replaceButton}
                      onPress={() => setActivePickerDoc('rc')}
                    >
                      <Text style={styles.replaceButtonText}>Replace</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.dropZone}
                    onPress={() => setActivePickerDoc('rc')}
                  >
                    <Upload size={22} color="#FF6600" />
                    <Text style={styles.dropZoneText}>Upload RC Document</Text>
                  </TouchableOpacity>
                )}
                {errors.rcImage && (
                  <Text style={styles.errorText}>{errors.rcImage.message}</Text>
                )}
              </View>
            </View>

            {/* 2. Vehicle Insurance Card */}
            <View style={styles.complianceCard}>
              <Text style={styles.complianceCardTitle}>2. Vehicle Insurance Policy *</Text>
              <Text style={styles.complianceCardSubtitle}>
                Enter policy details and upload active third-party or comprehensive policy.
              </Text>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Controller
                    control={control}
                    name="insuranceNumber"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Policy Number"
                        required
                        placeholder="e.g. POL-998877"
                        value={value}
                        onChangeText={onChange}
                        error={errors.insuranceNumber?.message}
                      />
                    )}
                  />
                </View>
                <View style={styles.col}>
                  <Controller
                    control={control}
                    name="insuranceExpiry"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Expiry Date"
                        required
                        placeholder="YYYY-MM-DD"
                        value={value}
                        onChangeText={onChange}
                        error={errors.insuranceExpiry?.message}
                        maxLength={10}
                      />
                    )}
                  />
                </View>
              </View>

              <View style={styles.previewBox}>
                {insuranceImage ? (
                  <View style={styles.previewCard}>
                    <Image source={{ uri: insuranceImage }} style={styles.previewImage} />
                    <View style={styles.verifiedTag}>
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text style={styles.verifiedTagText}>Insurance Uploaded</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.replaceButton}
                      onPress={() => setActivePickerDoc('insurance')}
                    >
                      <Text style={styles.replaceButtonText}>Replace</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.dropZone}
                    onPress={() => setActivePickerDoc('insurance')}
                  >
                    <Upload size={22} color="#FF6600" />
                    <Text style={styles.dropZoneText}>Upload Insurance Document</Text>
                  </TouchableOpacity>
                )}
                {errors.insuranceImage && (
                  <Text style={styles.errorText}>{errors.insuranceImage.message}</Text>
                )}
              </View>
            </View>

            {/* 3. Pollution Certificate (PUC) Card */}
            <View style={styles.complianceCard}>
              <Text style={styles.complianceCardTitle}>3. Pollution Under Control (PUC) (Optional)</Text>
              <Text style={styles.complianceCardSubtitle}>
                Valid emission test certificate if applicable.
              </Text>

              <View style={styles.previewBox}>
                {pucImage ? (
                  <View style={styles.previewCard}>
                    <Image source={{ uri: pucImage }} style={styles.previewImage} />
                    <View style={styles.verifiedTag}>
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text style={styles.verifiedTagText}>PUC Uploaded</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.replaceButton}
                      onPress={() => setActivePickerDoc('puc')}
                    >
                      <Text style={styles.replaceButtonText}>Replace</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.dropZone}
                    onPress={() => setActivePickerDoc('puc')}
                  >
                    <Upload size={22} color="#FF6600" />
                    <Text style={styles.dropZoneText}>Upload PUC Certificate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        )}

        {/* Safety Undertaking Trust Badge */}
        <View style={styles.trustBadge}>
          <ShieldCheck size={20} color="#10B981" />
          <Text style={styles.trustText}>
            Vehicle records are verified via Government VAHAN & Sarathi database.
          </Text>
        </View>

        {/* Image Picker Modal */}
        <ImagePickerModal
          visible={activePickerDoc !== null}
          onClose={() => setActivePickerDoc(null)}
          onImageSelected={handleImagePicked}
          title={
            activePickerDoc === 'rc'
              ? 'Upload Registration Certificate (RC)'
              : activePickerDoc === 'insurance'
              ? 'Upload Vehicle Insurance Policy'
              : 'Upload Pollution Certificate (PUC)'
          }
          showDocumentOption={true}
        />
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionHeaderTitle: {
    ...Typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  vehicleChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  vehicleChipSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6600',
  },
  vehicleChipText: {
    ...Typography.bodySmall,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
  vehicleChipTextSelected: {
    color: '#FF6600',
    fontWeight: '800',
  },
  ownershipChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  ownershipChipSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6600',
  },
  ownershipChipText: {
    ...Typography.bodySmall,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 12.5,
  },
  ownershipChipTextSelected: {
    color: '#FF6600',
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  complianceHeaderTitle: {
    ...Typography.titleMedium,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 18,
  },
  complianceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  complianceCardTitle: {
    ...Typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },
  complianceCardSubtitle: {
    ...Typography.bodySmall,
    color: '#64748B',
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: Spacing.xs,
  },
  previewBox: {
    marginTop: Spacing.xs,
  },
  dropZone: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    height: 105,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dropZoneText: {
    ...Typography.bodySmall,
    color: '#FF6600',
    fontWeight: '700',
    fontSize: 13,
  },
  previewCard: {
    position: 'relative',
    height: 110,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  verifiedTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  verifiedTagText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  replaceButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#FF6600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  replaceButtonText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  trustText: {
    ...Typography.bodySmall,
    color: '#065F46',
    flex: 1,
    fontWeight: '600',
    fontSize: 12.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default VehicleStepScreen;
