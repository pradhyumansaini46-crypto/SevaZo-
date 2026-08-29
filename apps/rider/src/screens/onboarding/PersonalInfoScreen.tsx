import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '../../utils/zodResolver';
import { Camera, Image as ImageIcon, CheckCircle, User, ShieldCheck } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { Input } from '../../components/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { personalInfoSchema, PersonalInfoFormValues } from '../../validation/onboardingValidation';

import * as ImagePicker from 'expo-image-picker';
import { ImagePickerModal } from '../../components/ImagePickerModal';
import { Alert } from 'react-native';

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
    },
  });

  useEffect(() => {
    setValue('profilePhoto', profilePhoto);
  }, [profilePhoto, setValue]);

  const onSubmit = async (data: PersonalInfoFormValues) => {
    clearError();
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

  const handleSelectPhoto = async (type: 'camera' | 'gallery') => {
    try {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'Please grant camera permissions in your phone settings to take a profile photo.'
          );
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const pickedUri = result.assets[0].uri;
          setProfilePhoto(pickedUri);
          setValue('profilePhoto', pickedUri, { shouldValidate: true });
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Gallery Permission Required',
            'Please grant photo library permissions in your phone settings to select a profile photo.'
          );
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const pickedUri = result.assets[0].uri;
          setProfilePhoto(pickedUri);
          setValue('profilePhoto', pickedUri, { shouldValidate: true });
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open camera or gallery. Please try again.');
    }
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={14}
      stepTitle="Personal Information"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingResume')}
      onSaveContinue={handleSubmit(onSubmit)}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Personal Details"
        subtitle="Provide your legal name and a clear front-facing photo for customer & delivery identification."
        error={error}
      >
        {/* Profile Photo Section (Point 11) */}
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
                onPress={() => handleSelectPhoto('camera')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Take photo with camera"
              >
                <Camera size={16} color="#FF6600" />
                <Text style={styles.photoBtnText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.photoBtn, styles.galleryBtn]}
                onPress={() => handleSelectPhoto('gallery')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Choose photo from gallery"
              >
                <ImageIcon size={16} color={Colors.textSecondary} />
                <Text style={[styles.photoBtnText, { color: Colors.textSecondary }]}>Gallery</Text>
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

        {/* Date of Birth & Age Validation */}
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

        <View style={styles.trustBadge}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustText}>
            Personal data is encrypted and securely stored for partner verification.
          </Text>
        </View>

        {/* Native Image Picker Modal */}
        <ImagePickerModal
          visible={showPickerModal}
          onClose={() => setShowPickerModal(false)}
          onImageSelected={(uri) => {
            setProfilePhoto(uri);
            setValue('profilePhoto', uri, { shouldValidate: true });
          }}
          title="Upload Profile Photo"
          aspect={[1, 1]}
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
    gap: Spacing.sm,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255, 102, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#FF6600',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  galleryBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
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
