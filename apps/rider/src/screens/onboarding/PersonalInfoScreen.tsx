import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '../../utils/zodResolver';
import { Camera, Image as ImageIcon, CheckCircle, User, ShieldCheck, Lock, HeartHandshake } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { personalInfoSchema, PersonalInfoFormValues } from '../../validation/onboardingValidation';
import { ImagePickerModal } from '../../components/ImagePickerModal';

const RELATIONSHIPS = ['Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Friend', 'Other'] as const;

export const PersonalInfoScreen = ({ route, navigation }: any) => {
  const routeEmail = route?.params?.email;
  const { rider } = useAuthStore();
  const {
    draftData,
    completionPercentage,
    saveSection,
    isSaving,
    error,
    clearError,
  } = useOnboardingStore();

  const userEmail =
    routeEmail ||
    draftData?.personal?.email ||
    (rider?.email && rider?.email !== 'rahul.sharma@example.com' ? rider.email : '') ||
    '';

  const [profilePhoto, setProfilePhoto] = useState<string>(
    draftData?.personal?.profilePhoto ||
      (rider?.avatar && !rider.avatar.includes('unsplash') ? rider.avatar : '') ||
      ''
  );
  const [showPickerModal, setShowPickerModal] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: draftData?.personal?.firstName || '',
      lastName: draftData?.personal?.lastName || '',
      profilePhoto: profilePhoto,
      dob: draftData?.personal?.dob || '',
      gender: draftData?.personal?.gender || 'MALE',
      phone: rider?.phone || draftData?.personal?.phone || '',
      email: userEmail,
      emergencyContactName:
        draftData?.personal?.emergencyContactName ||
        draftData?.emergencyContact?.fullName ||
        '',
      emergencyRelationship:
        draftData?.personal?.emergencyRelationship ||
        draftData?.emergencyContact?.relationship ||
        'Father',
      emergencyPhone:
        draftData?.personal?.emergencyPhone ||
        draftData?.emergencyContact?.mobileNumber ||
        '',
    },
  });

  const selectedRelation = watch('emergencyRelationship');

  useEffect(() => {
    setValue('profilePhoto', profilePhoto);
  }, [profilePhoto, setValue]);

  const onSubmit = async (data: PersonalInfoFormValues) => {
    clearError();
    // Save to 'personal' section and also keep 'emergencyContact' in draftData for complete syncing
    const success = await saveSection('personal', data, true);
    if (success) {
      navigation.navigate('OnboardingAddress');
    }
  };

  const handleSaveExit = async () => {
    handleSubmit(async (data) => {
      await saveSection('personal', data, false);
      navigation.navigate('OnboardingResume');
    })();
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={8}
      stepTitle="Personal & Emergency Details"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('Welcome')}
      onSaveContinue={handleSubmit(onSubmit)}
      isLoading={isSaving}
    >
      <StepContainer
        title="Personal Information"
        subtitle="Provide your legal personal details and nominate a trusted emergency contact for on-road safety."
        error={error}
      >
        {/* Profile Photo Section */}
        <View style={styles.photoCard}>
          <Text style={styles.photoLabel}>Profile Photo *</Text>
          <Text style={styles.photoHint}>
            Take a clear photo in good lighting. Face must be unobstructed (no sunglasses or mask).
          </Text>

          <View style={styles.photoRow}>
            <View style={styles.avatarWrapper}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={36} color={Colors.textMuted} />
                </View>
              )}
            </View>

            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.photoBtn}
                onPress={() => setShowPickerModal(true)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Upload Profile Photo"
              >
                <Camera size={16} color="#FF6600" />
                <Text style={styles.photoBtnText}>Upload Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {errors.profilePhoto && (
            <Text style={styles.errorText}>{errors.profilePhoto.message}</Text>
          )}
        </View>

        {/* Legal Name Fields */}
        <View style={styles.nameRow}>
          <View style={styles.nameCol}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="First Name"
                  required
                  placeholder="First name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.firstName?.message}
                />
              )}
            />
          </View>

          <View style={styles.nameCol}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Last Name"
                  required
                  placeholder="Last name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.lastName?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Date of Birth */}
        <Controller
          control={control}
          name="dob"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Date of Birth"
              required
              placeholder="YYYY-MM-DD"
              value={value}
              onChangeText={(txt) => {
                const cleaned = txt.replace(/[^0-9-]/g, '');
                onChange(cleaned);
              }}
              error={errors.dob?.message}
              keyboardType="numbers-and-punctuation"
              helperText="Must be at least 18 years of age (e.g. 1998-05-15)"
            />
          )}
        />

        {/* Gender Selection Chips */}
        <View style={styles.genderContainer}>
          <Text style={styles.inputLabel}>Gender *</Text>
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <View style={styles.genderRow}>
                {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderOption, value === g && styles.genderOptionSelected]}
                    onPress={() => onChange(g)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Gender: ${g}`}
                  >
                    <Text
                      style={[styles.genderOptionText, value === g && styles.genderOptionTextSelected]}
                    >
                      {g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Verified Phone (Read-Only) */}
        <Controller
          control={control}
          name="phone"
          render={({ field: { value } }) => (
            <Input
              label="Mobile Number (Verified)"
              value={value}
              editable={false}
              rightIcon={<CheckCircle size={18} color="#10B981" />}
              helperText="Verified via OTP authentication"
            />
          )}
        />

        {/* Email Address */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email Address"
              placeholder="e.g. rahul.sharma@example.com"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        {/* ========================================================= */}
        {/* MERGED: Emergency Contact Section (Point 3)               */}
        {/* ========================================================= */}
        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <HeartHandshake size={20} color="#FF6600" />
          <Text style={styles.sectionTitle}>Emergency Contact Details</Text>
        </View>

        {/* Confidentiality Privacy Banner */}
        <View style={styles.privacyBanner}>
          <Lock size={16} color="#065F46" />
          <View style={styles.privacyTextContainer}>
            <Text style={styles.privacyTitle}>Strictly Confidential</Text>
            <Text style={styles.privacyDesc}>
              This information is strictly reserved for rider safety emergencies and is NEVER exposed to customers or vendors.
            </Text>
          </View>
        </View>

        {/* Emergency Contact Name */}
        <Controller
          control={control}
          name="emergencyContactName"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Emergency Contact Name"
              required
              placeholder="e.g. Ramesh Sharma"
              value={value}
              onChangeText={onChange}
              error={errors.emergencyContactName?.message}
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
                onPress={() => setValue('emergencyRelationship', rel, { shouldValidate: true })}
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
          {errors.emergencyRelationship && (
            <Text style={styles.errorText}>{errors.emergencyRelationship.message}</Text>
          )}
        </View>

        {/* Emergency Contact Mobile Number */}
        <Controller
          control={control}
          name="emergencyPhone"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Emergency Contact Mobile"
              required
              placeholder="10-digit mobile number"
              value={value}
              onChangeText={(txt) => onChange(txt.replace(/\D/g, ''))}
              error={errors.emergencyPhone?.message}
              keyboardType="phone-pad"
              maxLength={10}
              leftIcon={<Text style={styles.countryCode}>+91</Text>}
            />
          )}
        />

        <View style={styles.trustBadge}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustText}>
            Personal and emergency data is encrypted and securely stored for partner verification.
          </Text>
        </View>

        {/* Native Image Picker Modal for Profile Photo */}
        <ImagePickerModal
          visible={showPickerModal}
          onClose={() => setShowPickerModal(false)}
          onImageSelected={(uri) => {
            setProfilePhoto(uri);
            setValue('profilePhoto', uri, { shouldValidate: true });
          }}
          title="Upload Profile Photo"
          aspect={[1, 1]}
          showDocumentOption={false}
        />
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  photoCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  photoLabel: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  photoHint: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FF6600',
    backgroundColor: Colors.surfaceElevated,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    flex: 1,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255, 102, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#FF6600',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  photoBtnText: {
    ...Typography.bodySmall,
    color: '#FF6600',
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  nameCol: {
    flex: 1,
  },
  genderContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  genderOption: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: '#FF6600',
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
  },
  genderOptionText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  genderOptionTextSelected: {
    color: '#FF6600',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    ...Typography.titleSmall,
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  privacyDesc: {
    ...Typography.bodySmall,
    color: '#047857',
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
  },
  relationContainer: {
    marginBottom: Spacing.md,
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
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  trustText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    flex: 1,
  },
});

export default PersonalInfoScreen;
