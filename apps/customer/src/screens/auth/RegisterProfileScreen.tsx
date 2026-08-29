import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { User, Mail, Calendar, Camera } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { profileSchema } from '../../validation/authSchemas';

const sampleAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
];

export const RegisterProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { registrationDraft, updateRegistrationDraft } = useAuthStore();
  const { showToast } = useUiStore();

  const [firstName, setFirstName] = useState(registrationDraft.firstName || '');
  const [lastName, setLastName] = useState(registrationDraft.lastName || '');
  const [email, setEmail] = useState(registrationDraft.email || '');
  const [dob, setDob] = useState(registrationDraft.dob || '');
  const [avatar, setAvatar] = useState(registrationDraft.avatar || sampleAvatars[0]);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    const result = profileSchema.safeParse({
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      email: email.trim() || undefined,
      dob: dob.trim() || undefined,
      avatar,
    });

    if (!result.success) {
      const firstError = result.error.errors[0]?.message || 'Please check your inputs';
      setError(firstError);
      showToast('error', firstError, 'Validation Error');
      return;
    }

    setError(null);
    updateRegistrationDraft({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      dob: dob.trim(),
      avatar,
      currentStep: 'RegisterLocation',
    });

    showToast('success', 'Profile saved successfully!');
    navigation.navigate('RegisterLocation');
  };

  const handleSaveExit = () => {
    updateRegistrationDraft({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      dob: dob.trim(),
      avatar,
      currentStep: 'RegisterProfile',
    });
    showToast('info', 'Progress saved. You can resume anytime.', 'Saved');
    navigation.replace('Welcome');
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={6}
      stepTitle="Basic Profile"
      pageTitle="Tell us about yourself"
      pageSubtitle="Personalize your account for fast orders and accurate receipts."
      onBack={() => navigation.goBack()}
      onSaveExit={handleSaveExit}
      primaryButtonText="Continue to Location"
      onPrimaryPress={handleContinue}
    >
      {/* Profile Avatar Selector (Optional) */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: avatar }} style={styles.avatarImage} />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              const next = (sampleAvatars.indexOf(avatar) + 1) % sampleAvatars.length;
              setAvatar(sampleAvatars[next]);
            }}
            style={styles.cameraBadge}
          >
            <Camera size={14} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>

        <Text style={styles.avatarHint}>Tap avatar to change style (Optional)</Text>
      </View>

      {/* Form Inputs */}
      <View style={styles.formContainer}>
        {/* Name Row */}
        <View style={styles.nameRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>
              First Name <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={[styles.standardInputRow, !!error && !firstName.trim() && styles.inputError]}>
              <User size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.standardTextInput}
                placeholder="e.g. Rahul"
                placeholderTextColor={Colors.textMuted}
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (error) setError(null);
                }}
              />
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <View style={styles.standardInputRow}>
              <TextInput
                style={styles.standardTextInput}
                placeholder="e.g. Sharma"
                placeholderTextColor={Colors.textMuted}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
        </View>

        {/* Email Address */}
        <Text style={styles.inputLabel}>
          Email Address <Text style={styles.optionalTag}>(Optional for order receipts)</Text>
        </Text>
        <View style={styles.standardInputRow}>
          <Mail size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.standardTextInput}
            placeholder="rahul.sharma@example.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Date of Birth (Optional) */}
        <Text style={styles.inputLabel}>
          Date of Birth <Text style={styles.optionalTag}>(Optional: Birthday treats)</Text>
        </Text>
        <View style={styles.standardInputRow}>
          <Calendar size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.standardTextInput}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={Colors.textMuted}
            value={dob}
            onChangeText={setDob}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    width: 86,
    height: 86,
    borderRadius: BorderRadius.full,
    position: 'relative',
    ...Shadows.card,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  avatarHint: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  formContainer: {
    gap: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  requiredStar: {
    color: Colors.danger,
  },
  optionalTag: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  standardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  inputError: {
    borderColor: Colors.danger,
    backgroundColor: '#FEF2F2',
  },
  standardTextInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    fontWeight: '600',
    marginTop: 4,
  },
});
