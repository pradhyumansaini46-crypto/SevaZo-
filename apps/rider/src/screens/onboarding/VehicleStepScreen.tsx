import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Upload, CheckCircle2, ShieldCheck, AlertCircle, Car as CarIcon, FileText } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { ImagePickerModal } from '../../components/ImagePickerModal';
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

  const [rcImage, setRcImage] = useState<string>(
    draftData?.vehicle?.rcImage || draftData?.vehicleDocuments?.rcImage || ''
  );
  const [insuranceImage, setInsuranceImage] = useState<string>(
    draftData?.vehicle?.insuranceImage || draftData?.vehicleDocuments?.insuranceImage || ''
  );
  const [pucImage, setPucImage] = useState<string>(
    draftData?.vehicle?.pucImage || draftData?.vehicleDocuments?.pucImage || ''
  );
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
      registrationNumber: draftData?.vehicle?.registrationNumber || '',
      bicycleType: draftData?.vehicle?.bicycleType || 'STANDARD',
      bicycleBrand: draftData?.vehicle?.bicycleBrand || '',
      bicycleModel: draftData?.vehicle?.bicycleModel || '',
      rcNumber: draftData?.vehicle?.rcNumber || draftData?.vehicleDocuments?.rcNumber || '',
      rcImage: rcImage,
      insuranceNumber:
        draftData?.vehicle?.insuranceNumber || draftData?.vehicleDocuments?.insuranceNumber || '',
      insuranceExpiry:
        draftData?.vehicle?.insuranceExpiry || draftData?.vehicleDocuments?.insuranceExpiry || '',
      insuranceImage: insuranceImage,
      pucImage: pucImage,
    },
  });

  const selectedVehicleType = watch('vehicleType');
  const selectedOwnership = watch('ownershipType');
  const isBicycle = selectedVehicleType === 'BICYCLE';

  const handleFileSelected = (uri: string) => {
    if (activePickerDoc === 'rc') {
      setRcImage(uri);
      setValue('rcImage', uri, { shouldValidate: true });
    } else if (activePickerDoc === 'insurance') {
      setInsuranceImage(uri);
      setValue('insuranceImage', uri, { shouldValidate: true });
    } else if (activePickerDoc === 'puc') {
      setPucImage(uri);
      setValue('pucImage', uri, { shouldValidate: true });
    }
    setActivePickerDoc(null);
  };

  const onSubmit = async (data: VehicleFormValues) => {
    clearError();
    const payload = {
      ...data,
      rcNumber: data.registrationNumber || data.rcNumber || '',
      rcImage: isBicycle ? '' : rcImage || data.rcImage,
      insuranceImage: isBicycle ? '' : insuranceImage || data.insuranceImage,
      pucImage: isBicycle ? '' : pucImage || data.pucImage,
    };
    const success = await saveSection('vehicle', payload, true);
    if (success) {
      // Step 5 is Banking
      navigation.navigate('OnboardingBanking');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection(
        'vehicle',
        {
          ...data,
          rcNumber: data.registrationNumber || data.rcNumber || '',
          rcImage,
          insuranceImage,
          pucImage,
        },
        false
      );
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={9}
      stepTitle="Vehicle & Documents"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingIdentity')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Vehicle & Compliance Documents"
        subtitle="Select your delivery vehicle mode and provide vehicle registration details & documents."
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

        {/* Bicycle Specific Form */}
        {isBicycle ? (
          <View style={styles.section}>
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
          /* Motor Vehicle Form */
          <View style={styles.section}>
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
                  onChangeText={(txt) => onChange(txt.toUpperCase())}
                  error={errors.registrationNumber?.message}
                  autoCapitalize="characters"
                  helperText="Exact plate number registered on VAHAN database"
                />
              )}
            />

            {/* ======================================================= */}
            {/* MERGED: Vehicle Documents Section (Point 6)             */}
            {/* ======================================================= */}
            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <FileText size={20} color="#FF6600" />
              <Text style={styles.sectionHeaderTitle}>Vehicle Compliance Documents</Text>
            </View>

            {/* 1. Registration Certificate (RC) */}
            <View style={styles.docBlock}>
              <Text style={styles.blockTitle}>1. Registration Certificate (RC) *</Text>

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
                    <Upload size={20} color="#FF6600" />
                    <Text style={styles.dropZoneText}>Upload RC Document</Text>
                  </TouchableOpacity>
                )}
                {errors.rcImage && (
                  <Text style={styles.errorText}>{errors.rcImage.message}</Text>
                )}
              </View>
            </View>

            {/* 2. Vehicle Insurance */}
            <View style={styles.docBlock}>
              <Text style={styles.blockTitle}>2. Vehicle Insurance Policy *</Text>
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
                    <Upload size={20} color="#FF6600" />
                    <Text style={styles.dropZoneText}>Upload Insurance Document</Text>
                  </TouchableOpacity>
                )}
                {errors.insuranceImage && (
                  <Text style={styles.errorText}>{errors.insuranceImage.message}</Text>
                )}
              </View>
            </View>

            {/* 3. Pollution Certificate (PUC) - Optional */}
            <View style={styles.docBlock}>
              <Text style={styles.blockTitle}>3. Pollution Under Control (PUC) (Optional)</Text>
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
                    <Upload size={20} color="#FF6600" />
                    <Text style={styles.dropZoneText}>Upload PUC Certificate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.trustBadge}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustText}>
            Vehicle information is strictly verified for road safety and regulatory compliance.
          </Text>
        </View>

        {/* Document Picker Modal (Supports Camera, Gallery, and PDF/Document Browsing) */}
        <ImagePickerModal
          visible={activePickerDoc !== null}
          onClose={() => setActivePickerDoc(null)}
          onImageSelected={handleFileSelected}
          title={
            activePickerDoc === 'rc'
              ? 'Upload Registration Certificate (RC)'
              : activePickerDoc === 'insurance'
              ? 'Upload Vehicle Insurance'
              : 'Upload PUC Certificate'
          }
          aspect={[4, 3]}
          showDocumentOption={true}
        />
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionHeaderTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
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
    backgroundColor: '#FFF7ED',
  },
  vehicleChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  vehicleChipTextSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
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
    backgroundColor: '#FFF7ED',
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  docBlock: {
    marginBottom: Spacing.md,
  },
  blockTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontSize: 13,
    fontWeight: '700',
  },
  previewBox: {
    marginTop: Spacing.xs,
  },
  dropZone: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dropZoneText: {
    ...Typography.bodySmall,
    color: '#FF6600',
    fontWeight: '600',
  },
  previewCard: {
    position: 'relative',
    height: 100,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  verifiedTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedTagText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '700',
  },
  replaceButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  replaceButtonText: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  trustText: {
    ...Typography.bodySmall,
    color: '#065F46',
    flex: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default VehicleStepScreen;
