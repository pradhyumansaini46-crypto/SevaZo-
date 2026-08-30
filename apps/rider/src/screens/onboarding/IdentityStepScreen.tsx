import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '../../utils/zodResolver';
import { Upload, CheckCircle2, ShieldCheck, CreditCard, FileCheck, AlertCircle } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { ImagePickerModal, SelectedFilePayload } from '../../components/ImagePickerModal';
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

  const isBicycle = draftData?.vehicle?.vehicleType === 'BICYCLE';

  const initialIdType = (
    draftData?.identity?.idType && draftData?.identity?.idType !== 'PAN'
      ? draftData.identity.idType
      : 'AADHAAR'
  ) as 'AADHAAR' | 'VOTER_ID' | 'PASSPORT';

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

  // Driving licence state
  const [dlFrontImage, setDlFrontImage] = useState<string>(
    draftData?.identity?.licenseFrontImage || draftData?.drivingLicence?.frontImage || ''
  );
  const [dlBackImage, setDlBackImage] = useState<string>(
    draftData?.identity?.licenseBackImage || draftData?.drivingLicence?.backImage || ''
  );

  // Active modal picker target
  const [activePickerTarget, setActivePickerTarget] = useState<
    'id_front' | 'id_back' | 'dl_front' | 'dl_back' | null
  >(null);

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
      isBicycle: isBicycle,
      licenseNumber:
        draftData?.identity?.licenseNumber || draftData?.drivingLicence?.licenseNumber || '',
      expiryDate:
        draftData?.identity?.expiryDate || draftData?.drivingLicence?.expiryDate || '',
      licenseFrontImage: dlFrontImage,
      licenseBackImage: dlBackImage,
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

  const handleFileSelected = (uri: string) => {
    if (activePickerTarget === 'id_front') {
      setDocUploads((prev) => ({
        ...prev,
        [selectedIdType]: {
          ...prev[selectedIdType],
          frontImage: uri,
        },
      }));
      setValue('frontImage', uri, { shouldValidate: true });
    } else if (activePickerTarget === 'id_back') {
      setDocUploads((prev) => ({
        ...prev,
        [selectedIdType]: {
          ...prev[selectedIdType],
          backImage: uri,
        },
      }));
      setValue('backImage', uri, { shouldValidate: true });
    } else if (activePickerTarget === 'dl_front') {
      setDlFrontImage(uri);
      setValue('licenseFrontImage', uri, { shouldValidate: true });
    } else if (activePickerTarget === 'dl_back') {
      setDlBackImage(uri);
      setValue('licenseBackImage', uri, { shouldValidate: true });
    }
    setActivePickerTarget(null);
  };

  const onSubmit = async (data: IdentityFormValues) => {
    clearError();
    const payload = {
      ...data,
      frontImage: currentDoc.frontImage || data.frontImage,
      backImage: currentDoc.backImage || data.backImage,
      licenseFrontImage: dlFrontImage || data.licenseFrontImage,
      licenseBackImage: dlBackImage || data.licenseBackImage,
    };
    const success = await saveSection('identity', payload, true);
    if (success) {
      // Step 4 is Vehicle Registration
      navigation.navigate('OnboardingVehicle');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection(
        'identity',
        {
          ...data,
          frontImage: currentDoc.frontImage || data.frontImage,
          backImage: currentDoc.backImage || data.backImage,
          licenseFrontImage: dlFrontImage,
          licenseBackImage: dlBackImage,
        },
        false
      );
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={9}
      stepTitle="Identity & Licence"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingAddress')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Identity & Licence Verification"
        subtitle="Submit government-issued identification (PAN, Aadhaar/Passport) and your Driving Licence."
        error={error}
      >
        {/* PAN Card Field */}
        <View style={styles.panSection}>
          <Text style={styles.sectionHeaderTitle}>1. PAN Card Verification *</Text>
          <Controller
            control={control}
            name="panNumber"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Permanent Account Number (PAN)"
                required
                placeholder="e.g. ABCDE1234F"
                value={value}
                onChangeText={(txt) => onChange(txt.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                error={errors.panNumber?.message}
                autoCapitalize="characters"
                maxLength={10}
                leftIcon={<CreditCard size={18} color={Colors.textSecondary} />}
                helperText="10-character alphanumeric PAN issued by Income Tax Dept."
              />
            )}
          />
        </View>

        {/* Secondary ID Document Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>2. Government Photo ID *</Text>
          <Text style={styles.sectionSubtitle}>
            Select ID document type and upload front and back scans.
          </Text>

          <View style={styles.idTypeChips}>
            {ID_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.idChip,
                  selectedIdType === type.value && styles.idChipSelected,
                ]}
                onPress={() => handleIdTypeChange(type.value)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Select ID Type: ${type.label}`}
              >
                <Text
                  style={[
                    styles.idChipText,
                    selectedIdType === type.value && styles.idChipTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ID Number Input */}
          <Controller
            control={control}
            name="idNumber"
            render={({ field: { onChange, value } }) => (
              <Input
                label={`${activeTypeConfig.label} Number`}
                required
                placeholder={activeTypeConfig.placeholder}
                value={value}
                onChangeText={(txt) => {
                  onChange(txt);
                  setDocUploads((prev) => ({
                    ...prev,
                    [selectedIdType]: {
                      ...prev[selectedIdType],
                      idNumber: txt,
                    },
                  }));
                }}
                error={errors.idNumber?.message}
                helperText={activeTypeConfig.helper}
                autoCapitalize="characters"
              />
            )}
          />

          {/* Document Front & Back Upload Boxes */}
          <View style={styles.uploadRow}>
            {/* Front Side */}
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
                    onPress={() => setActivePickerTarget('id_front')}
                  >
                    <Text style={styles.replaceButtonText}>Replace</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.dropZone}
                  onPress={() => setActivePickerTarget('id_front')}
                >
                  <Upload size={22} color="#FF6600" />
                  <Text style={styles.dropZoneText}>Upload Front</Text>
                </TouchableOpacity>
              )}
              {errors.frontImage && (
                <Text style={styles.errorText}>{errors.frontImage.message}</Text>
              )}
            </View>

            {/* Back Side */}
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
                    onPress={() => setActivePickerTarget('id_back')}
                  >
                    <Text style={styles.replaceButtonText}>Replace</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.dropZone}
                  onPress={() => setActivePickerTarget('id_back')}
                >
                  <Upload size={22} color="#FF6600" />
                  <Text style={styles.dropZoneText}>Upload Back</Text>
                </TouchableOpacity>
              )}
              {errors.backImage && (
                <Text style={styles.errorText}>{errors.backImage.message}</Text>
              )}
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* MERGED: Driving Licence Verification (Point 5)            */}
        {/* ========================================================= */}
        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileCheck size={20} color="#FF6600" />
            <Text style={styles.sectionHeaderTitle}>3. Driving Licence (DL) *</Text>
          </View>

          {isBicycle ? (
            <View style={styles.bicycleNotice}>
              <Text style={styles.bicycleNoticeText}>
                🚲 Bicycle riders are exempt from Driving Licence requirements.
              </Text>
            </View>
          ) : (
            <>
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

              {/* DL Expiry */}
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
                    helperText="Licence must be valid and not expired"
                  />
                )}
              />

              {/* DL Front & Back Uploads */}
              <View style={styles.uploadRow}>
                {/* DL Front */}
                <View style={styles.uploadCard}>
                  <Text style={styles.uploadTitle}>DL Front Side *</Text>
                  {dlFrontImage ? (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: dlFrontImage }} style={styles.previewImage} />
                      <View style={styles.verifiedTag}>
                        <CheckCircle2 size={12} color="#10B981" />
                        <Text style={styles.verifiedTagText}>Uploaded</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.replaceButton}
                        onPress={() => setActivePickerTarget('dl_front')}
                      >
                        <Text style={styles.replaceButtonText}>Replace</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.dropZone}
                      onPress={() => setActivePickerTarget('dl_front')}
                    >
                      <Upload size={22} color="#FF6600" />
                      <Text style={styles.dropZoneText}>Upload Front</Text>
                    </TouchableOpacity>
                  )}
                  {errors.licenseFrontImage && (
                    <Text style={styles.errorText}>{errors.licenseFrontImage.message}</Text>
                  )}
                </View>

                {/* DL Back */}
                <View style={styles.uploadCard}>
                  <Text style={styles.uploadTitle}>DL Back Side *</Text>
                  {dlBackImage ? (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: dlBackImage }} style={styles.previewImage} />
                      <View style={styles.verifiedTag}>
                        <CheckCircle2 size={12} color="#10B981" />
                        <Text style={styles.verifiedTagText}>Uploaded</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.replaceButton}
                        onPress={() => setActivePickerTarget('dl_back')}
                      >
                        <Text style={styles.replaceButtonText}>Replace</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.dropZone}
                      onPress={() => setActivePickerTarget('dl_back')}
                    >
                      <Upload size={22} color="#FF6600" />
                      <Text style={styles.dropZoneText}>Upload Back</Text>
                    </TouchableOpacity>
                  )}
                  {errors.licenseBackImage && (
                    <Text style={styles.errorText}>{errors.licenseBackImage.message}</Text>
                  )}
                </View>
              </View>

              <View style={styles.noticeBanner}>
                <AlertCircle size={16} color="#FF6600" />
                <Text style={styles.noticeText}>
                  Ensure all 4 corners of your DL are visible. Learner's Licence (LLR) is not accepted.
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.trustBadge}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustText}>
            Identity and driving documents are cross-verified with official government registries.
          </Text>
        </View>

        {/* Image & Document Picker Modal (Supports Camera, Gallery, and Browse Files/PDF) */}
        <ImagePickerModal
          visible={activePickerTarget !== null}
          onClose={() => setActivePickerTarget(null)}
          onImageSelected={handleFileSelected}
          title={
            activePickerTarget === 'id_front'
              ? `Upload ${activeTypeConfig.label} (Front)`
              : activePickerTarget === 'id_back'
              ? `Upload ${activeTypeConfig.label} (Back)`
              : activePickerTarget === 'dl_front'
              ? 'Upload Driving Licence (Front)'
              : 'Upload Driving Licence (Back)'
          }
          aspect={[4, 3]}
          showDocumentOption={true}
        />
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  panSection: {
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeaderTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  idTypeChips: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  idChip: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  idChipSelected: {
    borderColor: '#FF6600',
    backgroundColor: '#FFF7ED',
  },
  idChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  idChipTextSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
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
    height: 110,
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
    height: 110,
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  bicycleNotice: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  bicycleNoticeText: {
    ...Typography.bodySmall,
    color: '#065F46',
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

export default IdentityStepScreen;
