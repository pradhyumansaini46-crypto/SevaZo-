import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowRight, ShieldCheck, Phone } from 'lucide-react-native';
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
      <View style={styles.header}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isDark ? colors.surface : '#FFF7ED',
              borderColor: colors.primary,
            },
          ]}
          accessible={true}
          accessibilityLabel="Phone login icon"
        >
          <Phone size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Login to Sevazo</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your registered mobile number to receive a verification code.
        </Text>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? colors.surface : '#F8FAFC',
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.textSecondary }]}>Mobile Number *</Text>
        <View style={[styles.phoneInputRow, Boolean(validationError) && styles.inputError]}>
          <View
            style={[
              styles.countryCodeBadge,
              {
                backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.countryCodeText, { color: colors.textPrimary }]}>🇮🇳 +91</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="Enter 10-digit number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            maxLength={10}
            accessible={true}
            accessibilityLabel="Mobile Number"
          />
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

      <Button
        title="Continue"
        variant="primary"
        size="large"
        onPress={handleContinue}
        isLoading={isLoading}
        disabled={isButtonDisabled}
        rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
        accessibilityLabel="Continue with mobile number"
      />

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>New to Sevazo? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          accessible={true}
          accessibilityRole="link"
          accessibilityLabel="Register as Delivery Rider"
        >
          <Text style={[styles.footerLink, { color: colors.primary }]}>
            Register as Delivery Rider
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.trustBadge}>
        <ShieldCheck size={16} color={colors.accentGreen} />
        <Text style={[styles.trustText, { color: colors.accentGreen }]}>
          Official verified delivery partner login portal
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xxl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: Spacing.md,
    ...Shadows.glowOrange,
  },
  title: {
    ...Typography.titleLarge,
    fontSize: 26,
  },
  subtitle: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  label: {
    ...Typography.bodySmall,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: BorderRadius.md,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  countryCodeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    borderWidth: 1,
  },
  countryCodeText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    ...Typography.bodySmall,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    ...Typography.bodySmall,
  },
  footerLink: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xxl,
  },
  trustText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
});

export default LoginScreen;
