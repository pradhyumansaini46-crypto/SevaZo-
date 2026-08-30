import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ArrowRight, CheckCircle2, Phone, ShieldCheck } from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows, useAppColors } from '../theme';
import { useAuthStore } from '../store/authStore';
import { phoneSchema } from '../validation/authValidation';
import { InteractiveLamp } from '../components/InteractiveLamp';

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [isLampOn, setIsLampOn] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { sendOtp, isLoading, error, clearError } = useAuthStore();
  const colors = useAppColors();

  const isPhoneValid = phone.replace(/\D/g, '').length === 10;

  const handleContinue = async () => {
    clearError();
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setValidationError(result.error.errors[0]?.message || 'Invalid mobile number');
      return;
    }
    setValidationError(null);

    const res = await sendOtp(phone);
    if (res.success) {
      navigation.navigate('Otp', {
        phone: `+91 ${phone}`,
        isRegister: false,
      });
    }
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setPhone(cleaned);
    if (validationError) setValidationError(null);
  };

  const isButtonDisabled = !isPhoneValid || isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Interactive Hanging Lamp */}
        <InteractiveLamp
          isLampOn={isLampOn}
          onToggle={(state) => setIsLampOn(state)}
        />

        {/* Modern Logic Card */}
        <View
          style={[
            styles.card,
            isLampOn ? styles.cardIlluminated : styles.cardDimmed,
          ]}
        >
          {/* Top Brand & Mode Switcher */}
          <View style={styles.topRow}>
            <View style={styles.brandBadge}>
              <View style={styles.brandIconCircle}>
                <Text style={styles.brandIconText}>S</Text>
              </View>
              <View>
                <Text style={styles.brandLabel}>SEVAZO FLEET</Text>
                <Text style={styles.brandSubLabel}>Partner Portal</Text>
              </View>
            </View>

            {/* Mode Switcher Tabs */}
            <View style={styles.tabContainer}>
              <View style={styles.tabActive}>
                <Text style={styles.tabActiveText}>Sign in</Text>
              </View>
              <TouchableOpacity
                style={styles.tabInactive}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}
              >
                <Text style={styles.tabInactiveText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Heading Greeting */}
          <View style={styles.headingBlock}>
            <Text style={styles.headingTitle}>Sign in to Sevazo</Text>
            <Text style={styles.headingSubtitle}>
              Welcome back. Enter your mobile number to receive a secure OTP.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            {/* Mobile Number */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Mobile Number *</Text>
                {isPhoneValid && (
                  <View style={styles.verifiedTag}>
                    <CheckCircle2 size={12} color="#10B981" />
                    <Text style={styles.verifiedText}>Valid</Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.inputRow,
                  Boolean(validationError) && styles.inputErrorRow,
                ]}
              >
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                  maxLength={10}
                  accessible={true}
                  accessibilityLabel="Mobile Number"
                />
              </View>
            </View>

            {validationError && (
              <Text style={styles.errorText} accessibilityRole="alert">
                {validationError}
              </Text>
            )}

            {error && (
              <Text style={styles.errorText} accessibilityRole="alert">
                {error}
              </Text>
            )}

            {/* Floating Action Pill & Target Track */}
            <View style={styles.actionTrack}>
              <View style={styles.targetDottedSlot}>
                <Text style={styles.targetDottedText}>
                  {isLoading ? 'VERIFYING...' : isPhoneValid ? 'READY TO SIGN IN' : 'ENTER 10 DIGITS'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitPill,
                  isPhoneValid ? styles.submitPillActive : styles.submitPillInactive,
                ]}
                onPress={handleContinue}
                disabled={isButtonDisabled}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.submitPillText,
                    isPhoneValid ? styles.submitPillTextActive : styles.submitPillTextInactive,
                  ]}
                >
                  {isLoading ? 'Sending Code...' : 'Get Verification Code'}
                </Text>
                <ArrowRight
                  size={18}
                  color={isPhoneValid ? '#FFFFFF' : '#64748B'}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>

            {/* Progress Bullet Hint */}
            <View style={styles.progressHintContainer}>
              <View
                style={[
                  styles.progressDot,
                  { backgroundColor: isPhoneValid ? '#10B981' : '#FF6600' },
                ]}
              />
              <Text style={styles.progressHintText}>
                {isPhoneValid
                  ? 'One tap away — ready to receive OTP.'
                  : 'Enter your 10-digit registered number.'}
              </Text>
            </View>
          </View>

          {/* Switch to Register Link */}
          <View style={styles.switchModeContainer}>
            <Text style={styles.switchModeText}>New to Sevazo? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.switchModeLink}>Register as Rider</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Trust Footer */}
        <View style={styles.trustFooter}>
          <ShieldCheck size={15} color="#10B981" />
          <Text style={styles.trustFooterText}>
            Official verified delivery partner login portal
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06080F',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 40,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 30,
    elevation: 10,
  },
  cardIlluminated: {
    backgroundColor: '#0E1422',
    borderColor: '#1E293B',
    shadowOpacity: 0.6,
  },
  cardDimmed: {
    backgroundColor: '#0A0D15',
    borderColor: '#161F2E',
    shadowOpacity: 0.3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  brandIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FF6600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF6600',
    letterSpacing: 0.5,
  },
  brandSubLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#05070C',
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tabActive: {
    backgroundColor: '#FF6600',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  tabActiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tabInactive: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  tabInactiveText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  headingBlock: {
    marginBottom: Spacing.xl,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headingSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  formGroup: {
    gap: Spacing.md,
  },
  inputContainer: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07090E',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputErrorRow: {
    borderColor: '#EF4444',
  },
  countryCodeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
    backgroundColor: '#0B0F19',
  },
  countryCodeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  actionTrack: {
    position: 'relative',
    height: 56,
    backgroundColor: '#05070C',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  targetDottedSlot: {
    position: 'absolute',
    width: '80%',
    height: 38,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#334155',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetDottedText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  submitPill: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 4,
    bottom: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  submitPillActive: {
    backgroundColor: '#FF6600',
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  submitPillInactive: {
    backgroundColor: '#1E293B',
  },
  submitPillText: {
    fontSize: 14,
    fontWeight: '800',
  },
  submitPillTextActive: {
    color: '#FFFFFF',
  },
  submitPillTextInactive: {
    color: '#64748B',
  },
  progressHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  progressHintText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  switchModeText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  switchModeLink: {
    color: '#FF6600',
    fontSize: 12,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xl,
  },
  trustFooterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 2,
  },
});

export default LoginScreen;
