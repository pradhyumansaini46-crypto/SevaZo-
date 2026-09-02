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
  const [email, setEmail] = useState('');
  const [isLampOn, setIsLampOn] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleContinue = async () => {
    setValidationError(null);

    if (!isEmailValid) {
      setValidationError('Please enter a valid email address (e.g. name@icloud.com, name@yahoo.com, name@gmail.com)');
      return;
    }

    setIsLoading(true);
    try {
      const res = await VendorApi.sendOtp(email.trim());
      navigation.navigate('OtpVerification', {
        phone: '9876543210',
        email: email.trim(),
        isRegister: false,
        message: res.message || 'OTP sent successfully to your email from Support@sevazo.in',
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

  const isButtonDisabled = !isEmailValid || isLoading;

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
              Welcome back merchant. Enter your registered email address to receive OTP from Support@sevazo.in.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Registered Email Address *</Text>
              <View style={[styles.inputRow, Boolean(validationError) && styles.inputErrorRow]}>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Enter email (e.g. merchant@icloud.com)"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessible={true}
                  accessibilityLabel="Registered Email Address"
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
              <TouchableOpacity
                style={[
                  styles.submitPill,
                  !isButtonDisabled ? styles.submitPillActive : styles.submitPillInactive,
                ]}
                onPress={handleContinue}
                disabled={isButtonDisabled}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.submitPillText,
                    !isButtonDisabled ? styles.submitPillTextActive : styles.submitPillTextInactive,
                  ]}
                >
                  {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                </Text>
                <ArrowRight
                  size={18}
                  color={!isButtonDisabled ? '#FFFFFF' : '#94A3B8'}
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
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 54,
  },
  inputErrorRow: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  countryCodeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderRightWidth: 1.5,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  countryCodeText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  textInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15.5,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  actionTrack: {
    position: 'relative',
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    overflow: 'hidden',
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
    fontSize: 15,
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
