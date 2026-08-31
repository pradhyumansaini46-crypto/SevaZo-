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
import { ArrowRight, ShieldCheck } from 'lucide-react-native';
import { Spacing, BorderRadius } from '../../theme';
import { phoneSchema } from '../../validation/schemas';
import { InteractiveLamp } from '../../components/InteractiveLamp';
import { VendorApi } from '../../services/vendorApi';
import { normalizeApiError } from '../../utils';

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [isLampOn, setIsLampOn] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isPhoneValid = phone.replace(/\D/g, '').length === 10;

  const handleContinue = async () => {
    setValidationError(null);
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setValidationError(result.error.errors[0]?.message || 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await VendorApi.sendOtp(phone);
      navigation.navigate('OtpVerification', {
        phone,
        isRegister: false,
        message: res.message,
      });
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      if (normalized.code === 'RATE_LIMIT_EXCEEDED' || normalized.statusCode === 429) {
        setValidationError('Too many OTP requests. Please wait a few minutes before trying again.');
      } else {
        setValidationError(normalized.message || 'Unable to send OTP. Please try again.');
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
          {/* 3. Water Droplet Sliding Segmented Control */}
          <View style={styles.tabPillContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, styles.tabBtnActive]}
              activeOpacity={1}
            >
              <Text style={styles.tabBtnTextActive}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.tabBtnTextInactive}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Heading Greeting */}
          <View style={styles.headingBlock}>
            <Text style={styles.headingTitle}>Sign in to SevaZo</Text>
            <Text style={styles.headingSubtitle}>
              Welcome back merchant. Enter your mobile number to receive a secure OTP.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            {/* Mobile Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number *</Text>
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

            {validationError && (
              <Text style={styles.errorText} accessibilityRole="alert">
                {validationError}
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
                  color={isPhoneValid ? '#FFFFFF' : '#94A3B8'}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch to Register Link */}
          <View style={styles.switchModeContainer}>
            <Text style={styles.switchModeText}>New to SevaZo? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.switchModeLink}>Register Your Business</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Trust Footer */}
        <View style={styles.trustFooter}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.trustFooterText}>
            Official verified merchant partner login portal
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

export default LoginScreen;
