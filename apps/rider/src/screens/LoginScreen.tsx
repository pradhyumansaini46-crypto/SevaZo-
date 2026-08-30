import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { ArrowRight, CheckCircle2, Phone, Sparkles } from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows, useAppColors } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/Button';
import { phoneSchema } from '../validation/authValidation';

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { sendOtp, isLoading, error, clearError } = useAuthStore();
  const colors = useAppColors();
  const isDark = useThemeStore((state) => state.isDark);

  const isValidPhone = phone.length === 10;

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

  const isButtonDisabled = phone.length < 10 || isLoading;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Sleek Top Brand Header Bar */}
      <View style={styles.brandRow}>
        <Image
          source={require('../../assets/sevazo-logo.png')}
          style={styles.brandLogoSmall}
          resizeMode="contain"
        />
        <Text style={[styles.brandText, { color: colors.textSecondary }]}>SEVAZO RIDER</Text>
      </View>

      {/* Main Form Card */}
      <View
        style={[
          styles.mainCard,
          {
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            borderColor: isDark ? colors.border : '#E2E8F0',
          },
        ]}
      >
        {/* Title & Micro-Copy */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Sign in</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Welcome back. Enter your registered mobile number to receive your OTP.
          </Text>
        </View>

        {/* Mobile Input Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mobile Number</Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? colors.surfaceElevated : '#F8FAFC',
                borderColor: validationError
                  ? '#EF4444'
                  : isValidPhone
                  ? '#10B981'
                  : isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : '#E2E8F0',
              },
            ]}
          >
            <View style={styles.countryCodeContainer}>
              <Phone size={18} color={colors.primary} />
              <Text style={[styles.countryCodeText, { color: colors.textPrimary }]}>+91</Text>
            </View>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
              accessible={true}
              accessibilityLabel="Mobile Number input"
            />
            {isValidPhone && (
              <View style={styles.validCheckBadge}>
                <CheckCircle2 size={18} color="#10B981" />
              </View>
            )}
          </View>

          {validationError && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {validationError}
            </Text>
          )}
        </View>

        {error && (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        )}

        {/* Action Button Container */}
        <View style={styles.actionContainer}>
          <Button
            title="Log in with OTP"
            variant="primary"
            size="large"
            onPress={handleContinue}
            isLoading={isLoading}
            disabled={isButtonDisabled}
            rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
            accessibilityLabel="Log in with OTP"
          />

          {/* Micro Helper State Indicator */}
          <View style={styles.helperStatusRow}>
            <View style={[styles.statusDot, { backgroundColor: isValidPhone ? '#10B981' : colors.primary }]} />
            <Text style={[styles.helperStatusText, { color: colors.textSecondary }]}>
              {isValidPhone ? 'Ready to receive OTP verification code' : '10-digit number required for login'}
            </Text>
          </View>
        </View>

        {/* Bottom Switch Link */}
        <View style={styles.switchRow}>
          <Text style={[styles.switchText, { color: colors.textSecondary }]}>No account yet? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="Register as Rider"
          >
            <Text style={[styles.switchLink, { color: colors.primary }]}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trust Footer */}
      <View style={styles.trustFooter}>
        <Sparkles size={14} color={colors.accentGreen} />
        <Text style={[styles.trustText, { color: colors.textSecondary }]}>
          Instant store pickup & short-distance drops • 100% Secure
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  brandLogoSmall: {
    width: 36,
    height: 36,
  },
  brandText: {
    ...Typography.bodySmall,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontSize: 12,
  },
  mainCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  titleSection: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.hero,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.bodyMedium,
    marginTop: Spacing.xs,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    height: 54,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingRight: Spacing.sm,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  countryCodeText: {
    ...Typography.titleSmall,
    fontWeight: '700',
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 18,
    fontWeight: '700',
    height: '100%',
  },
  validCheckBadge: {
    paddingLeft: Spacing.xs,
  },
  errorText: {
    color: '#EF4444',
    marginTop: Spacing.xs,
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: Spacing.md,
  },
  helperStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  helperStatusText: {
    ...Typography.bodySmall,
    fontSize: 12,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
  },
  switchText: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  switchLink: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    fontSize: 14,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  trustText: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default LoginScreen;
