import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '../../utils/zodResolver';
import { Upload, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { ImagePickerModal } from '../../components/ImagePickerModal';
import { useOnboardingStore } from '../../store/onboardingStore';
import { vehicleDocumentsSchema, VehicleDocumentsFormValues } from '../../validation/onboardingValidation';

export const VehicleDocumentsStepScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const [rcImage, setRcImage] = useState<string>(draftData?.vehicleDocuments?.rcImage || '');
  const [insuranceImage, setInsuranceImage] = useState<string>(
    draftData?.vehicleDocuments?.insuranceImage || ''
  );
  const [pucImage, setPucImage] = useState<string>(draftData?.vehicleDocuments?.pucImage || '');
  const [activePickerDoc, setActivePickerDoc] = useState<'rc' | 'insurance' | 'puc' | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VehicleDocumentsFormValues>({
    resolver: zodResolver(vehicleDocumentsSchema),
    defaultValues: {
      rcNumber: draftData?.vehicleDocuments?.rcNumber || '',
      rcImage: rcImage,
      insuranceNumber: draftData?.vehicleDocuments?.insuranceNumber || '',
      insuranceExpiry: draftData?.vehicleDocuments?.insuranceExpiry || '',
      insuranceImage: insuranceImage,
      pucImage: pucImage,
    },
  });

  const handleImageSelected = (uri: string) => {
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

  const onSubmit = async (data: VehicleDocumentsFormValues) => {
    clearError();
    const payload = { ...data, rcImage, insuranceImage, pucImage };
    const success = await saveSection('vehicle_documents', payload, true);
    if (success) {
      navigation.navigate('OnboardingBanking');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection(
        'vehicle_documents',
        { ...data, rcImage, insuranceImage, pucImage },
        false
      );
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={8}
      totalSteps={14}
      stepTitle="Vehicle Documents"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingDrivingLicence')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Vehicle Documents"
        subtitle="Upload Registration Certificate (RC), valid Vehicle Insurance, and Pollution Certificate (PUC)."
        error={error}
      >
        {/* Registration Certificate (RC) */}
        <View style={styles.docBlock}>
          <Text style={styles.blockTitle}>1. Registration Certificate (RC) *</Text>
          <Controller
            control={control}
            name="rcNumber"
            render={({ field: { onChange, value } }) => (
              <Input
                label="RC Registration Number"
                required
                placeholder="e.g. DL 01 AB 1234"
                value={value}
                onChangeText={(txt) => onChange(txt.toUpperCase())}
                error={errors.rcNumber?.message}
                autoCapitalize="characters"
              />
            )}
          />

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

        {/* Vehicle Insurance */}
        <View style={styles.docBlock}>
          <Text style={styles.blockTitle}>2. Vehicle Insurance Policy *</Text>
          <Controller
            control={control}
            name="insuranceNumber"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Insurance Policy Number"
                required
                placeholder="e.g. POL-99281726"
                value={value}
                onChangeText={(txt) => onChange(txt.toUpperCase())}
                error={errors.insuranceNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="insuranceExpiry"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Insurance Expiry Date (YYYY-MM-DD)"
                required
                placeholder="e.g. 2026-12-31"
                value={value}
                onChangeText={onChange}
                error={errors.insuranceExpiry?.message}
                helperText="Policy must be currently valid"
              />
            )}
          />

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

        {/* Pollution Under Control (PUC) - Optional */}
        <View style={styles.docBlock}>
          <Text style={styles.blockTitle}>3. Pollution Certificate (PUC) - Optional</Text>
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

        <View style={styles.trustBadge}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustText}>
            Vehicle records are verified with state RTO databases for safety standard compliance.
          </Text>
        </View>

        {/* Native Image Picker Modal */}
        <ImagePickerModal
          visible={activePickerDoc !== null}
          onClose={() => setActivePickerDoc(null)}
          onImageSelected={handleImageSelected}
          title={
            activePickerDoc === 'rc'
              ? 'Upload Registration Certificate (RC)'
              : activePickerDoc === 'insurance'
              ? 'Upload Insurance Policy'
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
  docBlock: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  blockTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  previewBox: {
    marginTop: Spacing.md,
  },
  dropZone: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dropZoneText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  previewCard: {
    position: 'relative',
    height: 120,
    borderRadius: BorderRadius.md,
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
    gap: Spacing.sm,
    backgroundColor: '#ECFDF5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
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

export default VehicleDocumentsStepScreen;
