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
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react-native';
import { Spacing, BorderRadius } from '../../theme';
import { phoneSchema, emailSchema } from '../../validation/schemas';
import { InteractiveLamp } from '../../components/InteractiveLamp';
import { VendorApi } from '../../services/vendorApi';
import { normalizeApiError } from '../../utils';

export const RegisterScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLampOn, setIsLampOn] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isPhoneValid = phone.replace(/\D/g, '').length === 10;
  const isEmailValid = email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleCreateAccount = async () => {
    setValidationError(null);

    const phoneResult = phoneSchema.safeParse(phone);
    if (!phoneResult.success) {
      setValidationError(phoneResult.error.errors[0]?.message || 'Please enter a valid 10-digit mobile number');
      return;
    }

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setValidationError(emailResult.error.errors[0]?.message || 'Please enter a valid business email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await VendorApi.registerOtp({ phone, email });
      navigation.navigate('OtpVerification', {
        phone,
        email,
        isRegister: true,
        message: res.message,
      });
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      if (normalized.statusCode === 409) {
        setValidationError('An account with this mobile number already exists. Please login instead.');
      } else if (normalized.code === 'RATE_LIMIT_EXCEEDED' || normalized.statusCode === 429) {
        setValidationError('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        setValidationError(normalized.message || 'Registration request failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setPhone(cleaned);
    if (validationError) setValidationError(null);
  };

  const isButtonDisabled = !isPhoneValid || !isEmailValid || isLoading;

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
          {/* 3. Water Droplet Sliding Segmented Control */}
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
            <Text style={styles.headingTitle}>Register Your Business</Text>
            <Text style={styles.headingSubtitle}>
              Join SevaZo as a verified merchant partner and scale your orders.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            {/* Mobile Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Primary Mobile Number *</Text>
              <View
                style={[
                  styles.inputRow,
                  Boolean(validationError) && !isPhoneValid && styles.inputErrorRow,
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
                  accessibilityLabel="Primary Mobile Number"
                />
              </View>
            </View>

            {/* Business / Owner Email Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business / Owner Email *</Text>
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
                  placeholder="store.owner@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessible={true}
                  accessibilityLabel="Business Email Address"
                />
              </View>
            </View>

            {validationError && (
              <Text style={styles.errorText} accessibilityRole="alert">
                {validationError}
              </Text>
            )}

            {/* Floating Action Pill & Target Track */}
            <View style={styles.actionTrack}>
              <View style={styles.targetDottedSlot}>
                <Text style={styles.targetDottedText}>
                  {isLoading
                    ? 'CREATING ACCOUNT...'
                    : isPhoneValid && isEmailValid
                    ? 'READY TO SUBMIT'
                    : 'FILL DETAILS'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitPill,
                  isPhoneValid && isEmailValid ? styles.submitPillActive : styles.submitPillInactive,
                ]}
                onPress={handleCreateAccount}
                disabled={isButtonDisabled}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.submitPillText,
                    isPhoneValid && isEmailValid ? styles.submitPillTextActive : styles.submitPillTextInactive,
                  ]}
                >
                  {isLoading ? 'Creating Account...' : 'Register Business'}
                </Text>
                <ArrowRight
                  size={18}
                  color={isPhoneValid && isEmailValid ? '#FFFFFF' : '#94A3B8'}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch to Login Link */}
          <View style={styles.switchModeContainer}>
            <Text style={styles.switchModeText}>Already have a vendor account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchModeLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Trust Footer */}
        <View style={styles.trustFooter}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustFooterText}>
            Official verified merchant partner registration portal
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
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: Spacing.xl,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 8,
    ...Platform.select({
      web: { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any,
      default: {},
    }),
  },
  cardIlluminated: {
    borderColor: 'rgba(254, 215, 170, 0.45)',
    shadowColor: '#FF6600',
    shadowOpacity: 0.1,
  },
  cardDimmed: {
    borderColor: 'rgba(226, 232, 240, 0.3)',
  },
  tabPillContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.6)',
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
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
    gap: Spacing.md + 4,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.45)',
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
    borderRightColor: 'rgba(226, 232, 240, 0.35)',
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
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
    backgroundColor: 'rgba(241, 245, 249, 0.55)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.35)',
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
