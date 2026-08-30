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
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react-native';
import { Spacing, BorderRadius } from '../theme';
import { useAuthStore } from '../store/authStore';
import { registerSchema } from '../validation/authValidation';
import { InteractiveLamp } from '../components/InteractiveLamp';

export const RegisterScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLampOn, setIsLampOn] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { register, isLoading, error, clearError } = useAuthStore();

  const isPhoneValid = phone.replace(/\D/g, '').length === 10;
  const isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleCreateAccount = async () => {
    clearError();
    const result = registerSchema.safeParse({ phone, email: email || undefined });
    if (!result.success) {
      setValidationError(result.error.errors[0]?.message || 'Please fix the errors');
      return;
    }
    setValidationError(null);

    const res = await register(phone, email || undefined);
    if (res.success) {
      navigation.navigate('Otp', {
        phone: `+91 ${phone}`,
        isRegister: true,
        email: email || undefined,
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
        {/* 1. Brand Heading H1 Above Hanging Lamp */}
        <Text style={styles.topBrandTitle}>SevaZo</Text>

        {/* 2. Interactive Hanging Lamp */}
        <InteractiveLamp
          isLampOn={isLampOn}
          onToggle={(state) => setIsLampOn(state)}
        />

        {/* Modern White Logic Card */}
        <View
          style={[
            styles.card,
            isLampOn ? styles.cardIlluminated : styles.cardDimmed,
          ]}
        >
          {/* 3. Water Droplet Sliding Segmented Control (Top-Left 'S' Block Removed) */}
          <View style={styles.tabPillContainer}>
            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.tabBtnTextInactive}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, styles.tabBtnActive]}
              activeOpacity={1}
            >
              <Text style={styles.tabBtnTextActive}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Heading Greeting */}
          <View style={styles.headingBlock}>
            <Text style={styles.headingTitle}>Create Rider Account</Text>
            <Text style={styles.headingSubtitle}>
              Join India's fastest-growing hyperlocal delivery fleet.
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
                    <CheckCircle2 size={13} color="#10B981" />
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
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  accessible={true}
                  accessibilityLabel="Mobile Number"
                />
              </View>
            </View>

            {/* Email Address (Optional) */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Email Address (Optional)</Text>
                {email.length > 0 && isEmailValid && (
                  <View style={styles.verifiedTag}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={styles.verifiedText}>Format OK</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputRow}>
                <View style={styles.iconPrefix}>
                  <Mail size={18} color="#94A3B8" />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessible={true}
                  accessibilityLabel="Email Address"
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
                  {isLoading ? 'VERIFYING...' : isPhoneValid ? 'READY TO SUBMIT' : 'ENTER MOBILE'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitPill,
                  isPhoneValid ? styles.submitPillActive : styles.submitPillInactive,
                ]}
                onPress={handleCreateAccount}
                disabled={isButtonDisabled}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.submitPillText,
                    isPhoneValid ? styles.submitPillTextActive : styles.submitPillTextInactive,
                  ]}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
                <ArrowRight
                  size={18}
                  color={isPhoneValid ? '#FFFFFF' : '#94A3B8'}
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
                  : '1 field stands between you and the road.'}
              </Text>
            </View>
          </View>

          {/* Switch to Login Link */}
          <View style={styles.switchModeContainer}>
            <Text style={styles.switchModeText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchModeLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Trust Footer */}
        <View style={styles.trustFooter}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustFooterText}>
            Official verified delivery partner registration portal
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 24,
  },
  topBrandTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 6,
    marginBottom: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.xl,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  cardIlluminated: {
    borderColor: '#FED7AA',
    shadowColor: '#FF6600',
    shadowOpacity: 0.12,
  },
  cardDimmed: {
    borderColor: '#E2E8F0',
  },
  tabPillContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
    width: 220,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FF6600',
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  tabBtnTextInactive: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  headingBlock: {
    marginBottom: Spacing.xl,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 19,
  },
  formGroup: {
    gap: Spacing.md + 2,
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
    fontWeight: '700',
    color: '#334155',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputErrorRow: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  countryCodeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  countryCodeText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  iconPrefix: {
    paddingLeft: Spacing.md,
    paddingRight: 4,
  },
  textInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
  },
  actionTrack: {
    position: 'relative',
    height: 56,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    borderColor: '#CBD5E1',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetDottedText: {
    color: '#94A3B8',
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
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  submitPillInactive: {
    backgroundColor: '#E2E8F0',
  },
  submitPillText: {
    fontSize: 14,
    fontWeight: '800',
  },
  submitPillTextActive: {
    color: '#FFFFFF',
  },
  submitPillTextInactive: {
    color: '#94A3B8',
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
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  switchModeText: {
    color: '#64748B',
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
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 2,
  },
});

export default RegisterScreen;
