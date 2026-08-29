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
import {
  MapPin,
  Home,
  Briefcase,
  Building,
  FileText,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { addressSchema } from '../../validation/authSchemas';

const addressTags = [
  { id: 'Home', label: 'Home', icon: Home },
  { id: 'Work', label: 'Work', icon: Briefcase },
  { id: 'Other', label: 'Other', icon: MapPin },
];

export const RegisterAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { registrationDraft, updateRegistrationDraft } = useAuthStore();
  const { showToast } = useUiStore();

  const [house, setHouse] = useState('');
  const [street, setStreet] = useState(registrationDraft.address?.line1 || '');
  const [locality, setLocality] = useState(registrationDraft.address?.line2 || '');
  const [city, setCity] = useState(registrationDraft.address?.city || '');
  const [state, setState] = useState(registrationDraft.address?.state || '');
  const [pincode, setPincode] = useState(registrationDraft.address?.pincode || '');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    const result = addressSchema.safeParse({
      label: tag,
      line1: house.trim() ? `${house.trim()}, ${street.trim()}` : '',
      line2: locality.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      instructions: instructions.trim() || undefined,
      isDefault: true,
    });

    if (!result.success) {
      const firstError = result.error.errors[0]?.message || 'Please fill in required address fields';
      setError(firstError);
      showToast('error', firstError, 'Address Validation');
      return;
    }

    setError(null);
    updateRegistrationDraft({
      address: {
        label: tag,
        line1: `${house.trim()}, ${street.trim()}`,
        line2: locality.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        landmark: landmark.trim(),
        latitude: registrationDraft.location?.latitude || 12.9716,
        longitude: registrationDraft.location?.longitude || 77.5946,
        isDefault: true,
      },
      currentStep: 'RegisterPreferences',
    });

    showToast('success', 'Address details verified!');
    navigation.navigate('RegisterPreferences');
  };

  const handleSaveExit = () => {
    updateRegistrationDraft({
      address: {
        label: tag,
        line1: house.trim() ? `${house.trim()}, ${street.trim()}` : street.trim(),
        line2: locality.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        landmark: landmark.trim(),
        latitude: registrationDraft.location?.latitude || 12.9716,
        longitude: registrationDraft.location?.longitude || 77.5946,
        isDefault: true,
      },
      currentStep: 'RegisterAddress',
    });
    showToast('info', 'Address draft saved. You can resume anytime.');
    navigation.replace('Welcome');
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={6}
      stepTitle="Delivery Address"
      pageTitle="Add delivery address"
      pageSubtitle="Accurate building and door details ensure 10-minute doorstep drop."
      onBack={() => navigation.goBack()}
      onSaveExit={handleSaveExit}
      primaryButtonText="Save Address & Continue"
      onPrimaryPress={handleContinue}
    >
      {/* Interactive Map Pin Confirmation Card */}
      <View style={styles.mapCard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80',
          }}
          style={styles.mapBackground}
        />
        <View style={styles.mapOverlay}>
          <View style={styles.pinBubble}>
            <MapPin size={24} color={Colors.primary} fill={Colors.primaryLight} />
            <Text style={styles.pinBubbleText}>Pinned Delivery Point</Text>
          </View>
        </View>
      </View>

      {/* Address Form */}
      <View style={styles.formContainer}>
        {/* Tag Selector */}
        <Text style={styles.inputLabel}>Save Address As</Text>
        <View style={styles.tagRow}>
          {addressTags.map((item) => {
            const IconComp = item.icon;
            const isSelected = tag === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => setTag(item.id as any)}
                style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
              >
                <IconComp
                  size={16}
                  color={isSelected ? Colors.primaryDark : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tagText,
                    isSelected && styles.tagTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* House / Flat */}
        <Text style={styles.inputLabel}>
          House / Flat / Floor / Building <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={[styles.standardInputRow, !!error && !house.trim() && styles.inputError]}>
          <Building size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.standardTextInput}
            placeholder="e.g. Flat 402, Block B, Green Heights"
            placeholderTextColor={Colors.textMuted}
            value={house}
            onChangeText={(text) => {
              setHouse(text);
              if (error) setError(null);
            }}
          />
        </View>

        {/* Street & Area */}
        <Text style={styles.inputLabel}>
          Area / Street / Locality <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.standardInputRow}>
          <TextInput
            style={styles.standardTextInput}
            placeholder="e.g. 100 Feet Road, HAL 2nd Stage"
            placeholderTextColor={Colors.textMuted}
            value={street}
            onChangeText={setStreet}
          />
        </View>

        {/* Landmark & Pincode Row */}
        <View style={styles.dualRow}>
          <View style={{ flex: 1.2 }}>
            <Text style={styles.inputLabel}>
              Landmark <Text style={styles.optionalTag}>(Optional)</Text>
            </Text>
            <View style={styles.standardInputRow}>
              <TextInput
                style={styles.standardTextInput}
                placeholder="Near Metro Pillar 42"
                placeholderTextColor={Colors.textMuted}
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>
          </View>

          <View style={{ flex: 0.8, marginLeft: Spacing.sm }}>
            <Text style={styles.inputLabel}>
              PIN Code <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={[styles.standardInputRow, !!error && pincode.length !== 6 && styles.inputError]}>
              <TextInput
                style={styles.standardTextInput}
                placeholder="560038"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                maxLength={6}
                value={pincode}
                onChangeText={(t) => {
                  setPincode(t.replace(/[^0-9]/g, ''));
                  if (error) setError(null);
                }}
              />
            </View>
          </View>
        </View>

        {/* City & State */}
        <View style={styles.dualRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>City</Text>
            <View style={styles.standardInputRow}>
              <TextInput
                style={styles.standardTextInput}
                placeholder="e.g. Bengaluru"
                placeholderTextColor={Colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.inputLabel}>State</Text>
            <View style={styles.standardInputRow}>
              <TextInput
                style={styles.standardTextInput}
                placeholder="e.g. Karnataka"
                placeholderTextColor={Colors.textMuted}
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>
        </View>

        {/* Delivery Instructions */}
        <Text style={styles.inputLabel}>
          Delivery Instructions <Text style={styles.optionalTag}>(Optional)</Text>
        </Text>
        <View style={styles.standardInputRow}>
          <FileText size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.standardTextInput}
            placeholder="e.g. Leave at door, Ring doorbell"
            placeholderTextColor={Colors.textMuted}
            value={instructions}
            onChangeText={setInstructions}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  mapCard: {
    height: 120,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapBackground: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBubble: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.elevated,
  },
  pinBubbleText: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  formContainer: {
    gap: Spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  tagButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  tagButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  tagText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  tagTextSelected: {
    color: Colors.primaryDark,
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
    height: 48,
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
  dualRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    fontWeight: '600',
    marginTop: 4,
  },
});
