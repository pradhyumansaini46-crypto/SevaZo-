import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Phone, Mail, Building2, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { phoneSchema, emailSchema } from '../../validation/schemas';
import { VendorApi } from '../../services/vendorApi';
import { normalizeApiError } from '../../utils';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhone(cleaned);
      if (phoneError) setPhoneError(undefined);
      if (globalError) setGlobalError(undefined);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError(undefined);
    if (globalError) setGlobalError(undefined);
  };

  const handleCreateAccount = async () => {
    let hasError = false;

    const phoneValidation = phoneSchema.safeParse(phone);
    if (!phoneValidation.success) {
      setPhoneError(phoneValidation.error.errors[0]?.message || 'Valid 10-digit mobile number required');
      hasError = true;
    }

    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      setEmailError(emailValidation.error.errors[0]?.message || 'Valid email address required');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    setGlobalError(undefined);

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
        setGlobalError('An account with this mobile number already exists. Please login instead.');
      } else if (normalized.code === 'RATE_LIMIT_EXCEEDED' || normalized.statusCode === 429) {
        setGlobalError('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        setGlobalError(normalized.message || 'Registration request failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = phone.length === 10 && email.trim().length > 4;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Hero Content */}
          <View style={styles.heroSection}>
            <View style={[styles.iconBox, { backgroundColor: '#EDE9FE' }]}>
              <Building2 size={28} color="#7C3AED" />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Register Your Business</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Create your merchant account to start selling products and services on Sevazo.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {globalError && (
              <View style={styles.globalErrorBox}>
                <Text style={styles.globalErrorText}>{globalError}</Text>
              </View>
            )}

            <Input
              label="Primary Mobile Number"
              placeholder="98765 43210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={handlePhoneChange}
              prefix="+91"
              error={phoneError}
              maxLength={10}
              leftIcon={<Phone size={18} color={colors.textSecondary} />}
              helperText="This mobile number will receive order dispatch OTPs and alerts."
            />

            <Input
              label="Business / Owner Email"
              placeholder="store.owner@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
              error={emailError}
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
              helperText="Official receipts, invoices, and settlement statements will be sent here."
            />

            <Button
              title="Create Account"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!isFormValid || loading}
              onPress={handleCreateAccount}
              rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
              style={styles.submitBtn}
            />

            {/* Verification Security Hint */}
            <View style={[styles.hintCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ShieldCheck size={16} color={colors.primary} />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                A 6-digit OTP will be sent to verify ownership of this mobile number.
              </Text>
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already registered on Sevazo?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Login Here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Shadows.card,
  },
  heroSection: {
    marginBottom: 28,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  formSection: {
    gap: 16,
  },
  globalErrorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: 12,
    borderRadius: BorderRadius.md,
  },
  globalErrorText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 8,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
