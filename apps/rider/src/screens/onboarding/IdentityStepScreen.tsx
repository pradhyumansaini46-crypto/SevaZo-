import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '../../utils/zodResolver';
import { Upload, CheckCircle2, CreditCard, FileCheck, AlertCircle } from 'lucide-react-native';
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
    placeholder: 'e.g. 2345 6789 0123',
    helper: '12-digit UIDAI number (starts with 2-9)',
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

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={8}
      stepTitle="Identity & Licence"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingAddress')}
      onSaveContinue={handleSubmit(onSubmit)}
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
                  let formatted = txt;
                  if (selectedIdType === 'AADHAAR') {
                    const digits = txt.replace(/\D/g, '').slice(0, 12);
                    formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                  } else {
                    formatted = txt.toUpperCase().trim();
                  }
                  onChange(formatted);
                  setDocUploads((prev) => ({
                    ...prev,
                    [selectedIdType]: {
                      ...prev[selectedIdType],
                      idNumber: formatted,
                    },
                  }));
                }}
                error={errors.idNumber?.message}
                helperText={activeTypeConfig.helper}
                autoCapitalize="characters"
                maxLength={selectedIdType === 'AADHAAR' ? 14 : 20}
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

        {/* Driving Licence Verification */}
        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileCheck size={20} color="#FF6600" />
            <Text style={styles.sectionHeaderTitle}>3. Driving Licence Verification</Text>
          </View>

          {isBicycle ? (
            <View style={styles.bicycleNotice}>
              <AlertCircle size={18} color="#10B981" />
              <Text style={styles.bicycleNoticeText}>
                Driving licence is optional for standard bicycles.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionSubtitle}>
                Required for motorized vehicles (Bike, Scooter, Car).
              </Text>

              {/* DL Number */}
              <Controller
                control={control}
                name="licenseNumber"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Driving Licence (DL) Number"
                    required
                    placeholder="e.g. RJ14 20180012345"
                    value={value}
                    onChangeText={(txt) => onChange(txt.toUpperCase().trim())}
                    error={errors.licenseNumber?.message}
                    autoCapitalize="characters"
                    helperText="Enter 15/16-digit standard Indian DL number."
                  />
                )}
              />

              {/* DL Expiry Date */}
              <Controller
                control={control}
                name="expiryDate"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Licence Expiry Date"
                    required
                    placeholder="YYYY-MM-DD"
                    value={value}
                    onChangeText={onChange}
                    error={errors.expiryDate?.message}
                    helperText="Must be a valid non-expired date."
                    maxLength={10}
                  />
                )}
              />

              {/* DL Scans */}
              <View style={styles.uploadRow}>
                {/* DL Front */}
                <View style={styles.uploadCard}>
                  <Text style={styles.uploadTitle}>DL Front Photo *</Text>
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
                  <Text style={styles.uploadTitle}>DL Back Photo *</Text>
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
            </>
          )}
        </View>

        {/* Modal for selecting upload source */}
        <ImagePickerModal
          visible={activePickerTarget !== null}
          onClose={() => setActivePickerTarget(null)}
          onImageSelected={handleFileSelected}
          title={
            activePickerTarget === 'dl_front' || activePickerTarget === 'dl_back'
              ? 'Upload Driving Licence Photo'
              : `Upload ${activeTypeConfig.label} Photo`
          }
          showDocumentOption={true}
        />
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  panSection: {
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  sectionHeaderTitle: {
    ...Typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 16,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.lg,
  },
  idTypeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  idChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  idChipSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6600',
  },
  idChipText: {
    ...Typography.bodySmall,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
  idChipTextSelected: {
    color: '#FF6600',
    fontWeight: '800',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  uploadCard: {
    flex: 1,
    gap: Spacing.xs,
  },
  uploadTitle: {
    ...Typography.bodyMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  dropZone: {
    height: 110,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  dropZoneText: {
    ...Typography.bodySmall,
    color: '#FF6600',
    fontWeight: '700',
    fontSize: 12,
  },
  previewContainer: {
    height: 110,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  verifiedTagText: {
    color: '#FFFFFF',
    fontSize: 10,
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
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bicycleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#ECFDF5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bicycleNoticeText: {
    ...Typography.bodySmall,
    color: '#065F46',
    flex: 1,
    fontWeight: '600',
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    fontSize: 11,
    marginTop: 2,
  },
});

export default IdentityStepScreen;
