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
import { ArrowRight, CheckCircle2, Phone, Mail, Sparkles } from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows, useAppColors } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/Button';
import { registerSchema } from '../validation/authValidation';

export const RegisterScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { register, isLoading, error, clearError } = useAuthStore();
  const colors = useAppColors();
  const isDark = useThemeStore((state) => state.isDark);

  const isValidPhone = phone.length === 10;
  const isValidEmail = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

      {/* Main Registration Card */}
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>Register</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join the fleet. Enter your details to start earning on your schedule.
          </Text>
        </View>

        {/* Mobile Input Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mobile Number *</Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? colors.surfaceElevated : '#F8FAFC',
                borderColor: validationError && !isValidPhone
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
              accessibilityLabel="Mobile Number"
            />
            {isValidPhone && (
              <View style={styles.validCheckBadge}>
                <CheckCircle2 size={18} color="#10B981" />
              </View>
            )}
          </View>
        </View>

        {/* Email Input Field (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address (Optional)</Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? colors.surfaceElevated : '#F8FAFC',
                borderColor: isValidEmail
                  ? '#10B981'
                  : isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : '#E2E8F0',
              },
            ]}
          >
            <View style={styles.iconPrefixContainer}>
              <Mail size={18} color={colors.textMuted} />
            </View>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (validationError) setValidationError(null);
              }}
              placeholder="name@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              accessible={true}
              accessibilityLabel="Email Address"
            />
            {isValidEmail && (
              <View style={styles.validCheckBadge}>
                <CheckCircle2 size={18} color="#10B981" />
              </View>
            )}
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

        {/* Action Button Container */}
        <View style={styles.actionContainer}>
          <Button
            title="Register & Get OTP"
            variant="primary"
            size="large"
            onPress={handleCreateAccount}
            isLoading={isLoading}
            disabled={isButtonDisabled}
            rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
            accessibilityLabel="Register & Get OTP"
          />

          {/* Micro Helper State Indicator */}
          <View style={styles.helperStatusRow}>
            <View style={[styles.statusDot, { backgroundColor: isValidPhone ? '#10B981' : colors.primary }]} />
            <Text style={[styles.helperStatusText, { color: colors.textSecondary }]}>
              {isValidPhone ? 'Ready — instant SMS OTP delivery' : 'Enter mobile number to continue'}
            </Text>
          </View>
        </View>

        {/* Bottom Switch Link */}
        <View style={styles.switchRow}>
          <Text style={[styles.switchText, { color: colors.textSecondary }]}>Already registered? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="Log in"
          >
            <Text style={[styles.switchLink, { color: colors.primary }]}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trust Footer */}
      <View style={styles.trustFooter}>
        <Sparkles size={14} color={colors.accentGreen} />
        <Text style={[styles.trustText, { color: colors.textSecondary }]}>
          Official Sevazo Partner Terms Apply • Fast Payouts
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
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    height: 52,
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
  iconPrefixContainer: {
    paddingRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: 16,
    fontWeight: '600',
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
    marginTop: Spacing.lg,
    paddingTop: Spacing.xs,
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

export default RegisterScreen;
