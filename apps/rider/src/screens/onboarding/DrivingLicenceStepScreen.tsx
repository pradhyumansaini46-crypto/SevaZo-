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
import { drivingLicenceSchema, DrivingLicenceFormValues } from '../../validation/onboardingValidation';

export const DrivingLicenceStepScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const [frontImage, setFrontImage] = useState<string>(draftData?.drivingLicence?.frontImage || '');
  const [backImage, setBackImage] = useState<string>(draftData?.drivingLicence?.backImage || '');
  const [activePickerSide, setActivePickerSide] = useState<'front' | 'back' | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DrivingLicenceFormValues>({
    resolver: zodResolver(drivingLicenceSchema),
    defaultValues: {
      licenseNumber: draftData?.drivingLicence?.licenseNumber || '',
      expiryDate: draftData?.drivingLicence?.expiryDate || '',
      frontImage: frontImage,
      backImage: backImage,
    },
  });

  const handleImageSelected = (uri: string) => {
    if (activePickerSide === 'front') {
      setFrontImage(uri);
      setValue('frontImage', uri, { shouldValidate: true });
    } else if (activePickerSide === 'back') {
      setBackImage(uri);
      setValue('backImage', uri, { shouldValidate: true });
    }
    setActivePickerSide(null);
  };

  const onSubmit = async (data: DrivingLicenceFormValues) => {
    clearError();
    const payload = { ...data, frontImage, backImage };
    const success = await saveSection('driving_license', payload, true);
    if (success) {
      navigation.navigate('OnboardingVehicleDocuments');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection('driving_license', { ...data, frontImage, backImage }, false);
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={7}
      totalSteps={14}
      stepTitle="Driving Licence"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingIdentity')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Driving Licence Verification"
        subtitle="Provide a valid, unexpired Commercial or Non-Transport Driving Licence (DL)."
        error={error}
      >
        {/* DL Number */}
        <Controller
          control={control}
          name="licenseNumber"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Driving Licence Number"
              required
              placeholder="e.g. DL-1420110012345"
              value={value}
              onChangeText={(txt) => onChange(txt.toUpperCase())}
              error={errors.licenseNumber?.message}
              autoCapitalize="characters"
            />
          )}
        />

        {/* Expiry Date */}
        <Controller
          control={control}
          name="expiryDate"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Valid Till / Expiry Date (YYYY-MM-DD)"
              required
              placeholder="e.g. 2032-12-31"
              value={value}
              onChangeText={onChange}
              error={errors.expiryDate?.message}
              helperText="Licence must not be expired"
            />
          )}
        />

        {/* Front & Back Photo Uploads */}
        <View style={styles.uploadRow}>
          {/* Front Photo */}
          <View style={styles.uploadCard}>
            <Text style={styles.uploadTitle}>DL Front Side *</Text>
            {frontImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: frontImage }} style={styles.previewImage} />
                <View style={styles.verifiedTag}>
                  <CheckCircle2 size={12} color="#10B981" />
                  <Text style={styles.verifiedTagText}>Uploaded</Text>
                </View>
                <TouchableOpacity
                  style={styles.replaceButton}
                  onPress={() => setActivePickerSide('front')}
                >
                  <Text style={styles.replaceButtonText}>Replace</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dropZone}
                onPress={() => setActivePickerSide('front')}
              >
                <Upload size={24} color="#FF6600" />
                <Text style={styles.dropZoneText}>Upload Front</Text>
              </TouchableOpacity>
            )}
            {errors.frontImage && (
              <Text style={styles.errorText}>{errors.frontImage.message}</Text>
            )}
          </View>

          {/* Back Photo */}
          <View style={styles.uploadCard}>
            <Text style={styles.uploadTitle}>DL Back Side *</Text>
            {backImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: backImage }} style={styles.previewImage} />
                <View style={styles.verifiedTag}>
                  <CheckCircle2 size={12} color="#10B981" />
                  <Text style={styles.verifiedTagText}>Uploaded</Text>
                </View>
                <TouchableOpacity
                  style={styles.replaceButton}
                  onPress={() => setActivePickerSide('back')}
                >
                  <Text style={styles.replaceButtonText}>Replace</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dropZone}
                onPress={() => setActivePickerSide('back')}
              >
                <Upload size={24} color="#FF6600" />
                <Text style={styles.dropZoneText}>Upload Back</Text>
              </TouchableOpacity>
            )}
            {errors.backImage && (
              <Text style={styles.errorText}>{errors.backImage.message}</Text>
            )}
          </View>
        </View>

        <View style={styles.noticeBanner}>
          <AlertCircle size={16} color="#FF6600" />
          <Text style={styles.noticeText}>
            Ensure all 4 corners of your DL are clearly visible. LLR (Learner's Licence) is not
            accepted.
          </Text>
        </View>

        <View style={styles.trustBadge}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustText}>
            DL authenticity is validated against Sarathi / Parivahan National Registry.
          </Text>
        </View>

        {/* Native Image Picker Modal */}
        <ImagePickerModal
          visible={activePickerSide !== null}
          onClose={() => setActivePickerSide(null)}
          onImageSelected={handleImageSelected}
          title={activePickerSide === 'front' ? 'Upload DL Front Side' : 'Upload DL Back Side'}
          aspect={[4, 3]}
        />
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  uploadRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  uploadCard: {
    flex: 1,
  },
  uploadTitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  dropZone: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dropZoneText: {
    ...Typography.bodySmall,
    color: '#FF6600',
    fontWeight: '600',
  },
  previewContainer: {
    position: 'relative',
    height: 120,
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
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
  },
  noticeText: {
    ...Typography.bodySmall,
    color: '#9A3412',
    flex: 1,
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

export default DrivingLicenceStepScreen;
