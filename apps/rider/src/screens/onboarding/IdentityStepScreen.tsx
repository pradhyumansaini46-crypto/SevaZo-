import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '../../utils/zodResolver';
import { Upload, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { ImagePickerModal } from '../../components/ImagePickerModal';
import { useOnboardingStore } from '../../store/onboardingStore';
import { identitySchema, IdentityFormValues } from '../../validation/onboardingValidation';

interface IdTypeOption {
  label: string;
  value: 'AADHAAR' | 'VOTER_ID' | 'PASSPORT';
  placeholder: string;
  helper: string;
}

const ID_TYPES: IdTypeOption[] = [
  {
    label: 'Aadhaar Card',
    value: 'AADHAAR',
    placeholder: 'e.g. 1234 5678 9012',
    helper: '12-digit UIDAI number',
  },
  {
    label: 'Voter ID',
    value: 'VOTER_ID',
    placeholder: 'e.g. ABC1234567',
    helper: 'Election Photo ID (EPIC) Number',
  },
  {
    label: 'Passport',
    value: 'PASSPORT',
    placeholder: 'e.g. A1234567',
    helper: 'Valid Indian Passport booklet number',
  },
];

interface DocState {
  idNumber: string;
  frontImage: string;
  backImage: string;
}

export const IdentityStepScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const initialIdType = (
    draftData?.identity?.idType && draftData?.identity?.idType !== 'PAN'
      ? draftData.identity.idType
      : 'AADHAAR'
  ) as 'AADHAAR' | 'VOTER_ID' | 'PASSPORT';

  // Track uploads independently per document type
  const [docUploads, setDocUploads] = useState<Record<string, DocState>>(() => ({
    AADHAAR: {
      idNumber: initialIdType === 'AADHAAR' ? draftData?.identity?.idNumber || '' : '',
      frontImage: initialIdType === 'AADHAAR' ? draftData?.identity?.frontImage || '' : '',
      backImage: initialIdType === 'AADHAAR' ? draftData?.identity?.backImage || '' : '',
    },
    VOTER_ID: {
      idNumber: initialIdType === 'VOTER_ID' ? draftData?.identity?.idNumber || '' : '',
      frontImage: initialIdType === 'VOTER_ID' ? draftData?.identity?.frontImage || '' : '',
      backImage: initialIdType === 'VOTER_ID' ? draftData?.identity?.backImage || '' : '',
    },
    PASSPORT: {
      idNumber: initialIdType === 'PASSPORT' ? draftData?.identity?.idNumber || '' : '',
      frontImage: initialIdType === 'PASSPORT' ? draftData?.identity?.frontImage || '' : '',
      backImage: initialIdType === 'PASSPORT' ? draftData?.identity?.backImage || '' : '',
    },
  }));

  const [activePickerSide, setActivePickerSide] = useState<'front' | 'back' | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      panNumber: draftData?.identity?.panNumber || '',
      idType: initialIdType,
      idNumber: docUploads[initialIdType]?.idNumber || '',
      frontImage: docUploads[initialIdType]?.frontImage || '',
      backImage: docUploads[initialIdType]?.backImage || '',
    },
  });

  const selectedIdType = watch('idType');
  const activeTypeConfig = ID_TYPES.find((t) => t.value === selectedIdType) || ID_TYPES[0];
  const currentDoc = docUploads[selectedIdType] || { idNumber: '', frontImage: '', backImage: '' };

  const handleIdTypeChange = (newType: 'AADHAAR' | 'VOTER_ID' | 'PASSPORT') => {
    setValue('idType', newType, { shouldValidate: true });
    const targetDoc = docUploads[newType] || { idNumber: '', frontImage: '', backImage: '' };
    setValue('idNumber', targetDoc.idNumber, { shouldValidate: false });
    setValue('frontImage', targetDoc.frontImage, { shouldValidate: !!targetDoc.frontImage });
    setValue('backImage', targetDoc.backImage, { shouldValidate: !!targetDoc.backImage });
  };

  const handleImageSelected = (uri: string) => {
    if (activePickerSide === 'front') {
      setDocUploads((prev) => ({
        ...prev,
        [selectedIdType]: {
          ...prev[selectedIdType],
          frontImage: uri,
        },
      }));
      setValue('frontImage', uri, { shouldValidate: true });
    } else if (activePickerSide === 'back') {
      setDocUploads((prev) => ({
        ...prev,
        [selectedIdType]: {
          ...prev[selectedIdType],
          backImage: uri,
        },
      }));
      setValue('backImage', uri, { shouldValidate: true });
    }
    setActivePickerSide(null);
  };

  const onSubmit = async (data: IdentityFormValues) => {
    clearError();
    const payload = {
      ...data,
      frontImage: currentDoc.frontImage || data.frontImage,
      backImage: currentDoc.backImage || data.backImage,
    };
    const success = await saveSection('identity', payload, true);
    if (success) {
      // If bicycle, skip Driving Licence and go to Banking
      const isBicycle = draftData?.vehicle?.vehicleType === 'BICYCLE';
      if (isBicycle) {
        navigation.navigate('OnboardingBanking');
      } else {
        navigation.navigate('OnboardingDrivingLicence');
      }
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      const payload = {
        ...data,
        frontImage: currentDoc.frontImage || data.frontImage,
        backImage: currentDoc.backImage || data.backImage,
      };
      await saveSection('identity', payload, false);
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={14}
      stepTitle="Identity Verification"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingVehicle')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Verify Your Identity"
        subtitle="Provide your PAN details and upload a government-approved identity document for KYC compliance."
        error={error}
      >
        {/* ================= 1. MANDATORY PAN NUMBER (TOP POSITION) ================= */}
        <View style={styles.panCardBox}>
          <View style={styles.panHeaderRow}>
            <CreditCard size={18} color="#FF6600" />
            <Text style={styles.panHeaderTitle}>Permanent Account Number (PAN) *</Text>
          </View>

          <Controller
            control={control}
            name="panNumber"
            render={({ field: { onChange, value } }) => (
              <Input
                label="PAN Card Number"
                required
                placeholder="e.g. ABCDE1234F"
                value={value}
                onChangeText={(txt) =>
                  onChange(txt.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))
                }
                error={errors.panNumber?.message}
                autoCapitalize="characters"
                maxLength={10}
                helperText="Mandatory government tax identifier for direct earnings payout & TDS compliance"
              />
            )}
          />
        </View>

        {/* ================= 2. SELECT SECONDARY GOVT ID (AADHAAR, VOTER ID, PASSPORT) ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Identity Document Type *</Text>
          <View style={styles.chipsRow}>
            {ID_TYPES.map((t) => {
              const isSelected = selectedIdType === t.value;
              return (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => handleIdTypeChange(t.value)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${t.label}`}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ================= 3. DYNAMIC DOCUMENT NUMBER INPUT ================= */}
        <Controller
          control={control}
          name="idNumber"
          render={({ field: { onChange, value } }) => (
            <Input
              label={`${activeTypeConfig.label} Number *`}
              required
              placeholder={activeTypeConfig.placeholder}
              value={value}
              onChangeText={(txt) => {
                let updatedTxt = txt;
                if (selectedIdType === 'AADHAAR') {
                  const clean = txt.replace(/\D/g, '').slice(0, 12);
                  updatedTxt = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
                } else {
                  updatedTxt = txt.toUpperCase();
                }
                onChange(updatedTxt);
                setDocUploads((prev) => ({
                  ...prev,
                  [selectedIdType]: {
                    ...prev[selectedIdType],
                    idNumber: updatedTxt,
                  },
                }));
              }}
              error={errors.idNumber?.message}
              autoCapitalize={selectedIdType === 'AADHAAR' ? 'none' : 'characters'}
              keyboardType={selectedIdType === 'AADHAAR' ? 'number-pad' : 'default'}
              maxLength={selectedIdType === 'AADHAAR' ? 14 : 16}
              helperText={activeTypeConfig.helper}
            />
          )}
        />

        {/* ================= 4. DEDICATED FRONT & BACK DOCUMENT UPLOAD CARDS ================= */}
        <View style={styles.uploadSectionHeader}>
          <Text style={styles.uploadSectionTitle}>
            Upload {activeTypeConfig.label} Photos *
          </Text>
          <Text style={styles.uploadSectionSubtitle}>
            Please upload clear front and back photos of your {activeTypeConfig.label}.
          </Text>
        </View>

        <View style={styles.uploadRow}>
          {/* Front Photo */}
          <View style={styles.uploadCard}>
            <Text style={styles.uploadTitle}>Front Side *</Text>
            {currentDoc.frontImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: currentDoc.frontImage }} style={styles.previewImage} />
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
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Upload front photo of ${activeTypeConfig.label}`}
              >
                <Upload size={24} color="#FF6600" />
                <Text style={styles.dropZoneText}>Upload Front</Text>
              </TouchableOpacity>
            )}
            {errors.frontImage && (
              <Text style={styles.errorText}>{errors.frontImage.message}</Text>
            )}
          </View>

          {/* Back Photo (Compulsory) */}
          <View style={styles.uploadCard}>
            <Text style={styles.uploadTitle}>Back Side *</Text>
            {currentDoc.backImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: currentDoc.backImage }} style={styles.previewImage} />
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
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Upload back photo of ${activeTypeConfig.label}`}
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

        {/* Security & Encryption Banner */}
        <View style={styles.trustBadge}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustText}>
            All identity document images are transferred via encrypted object storage with AES-256
            protection for UIDAI/KYC compliance.
          </Text>
        </View>

        {/* Native Image Picker Modal */}
        <ImagePickerModal
          visible={activePickerSide !== null}
          onClose={() => setActivePickerSide(null)}
          onImageSelected={handleImageSelected}
          title={
            activePickerSide === 'front'
              ? `Upload ${activeTypeConfig.label} (Front)`
              : `Upload ${activeTypeConfig.label} (Back)`
          }
          aspect={[4, 3]}
        />
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  panCardBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#FF6600',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  panHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  panHeaderTitle: {
    ...Typography.titleSmall,
    color: '#FF6600',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
    borderColor: '#FF6600',
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
  uploadSectionHeader: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  uploadSectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  uploadSectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
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
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#ECFDF5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
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

export default IdentityStepScreen;
