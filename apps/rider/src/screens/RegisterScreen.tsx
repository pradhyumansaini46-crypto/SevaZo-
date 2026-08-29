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
import { ArrowRight, ShieldCheck, UserPlus } from 'lucide-react-native';
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
          accessibilityLabel="Create account icon"
        >
          <UserPlus size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Create your Rider Account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Join India's fastest-growing hyperlocal delivery fleet.
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

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address (Optional)</Text>
        <TextInput
          style={[
            styles.emailInput,
            {
              backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (validationError) setValidationError(null);
          }}
          placeholder="e.g. name@example.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          accessible={true}
          accessibilityLabel="Email Address"
        />

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
        title="Create Account"
        variant="primary"
        size="large"
        onPress={handleCreateAccount}
        isLoading={isLoading}
        disabled={isButtonDisabled}
        rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
        accessibilityLabel="Create Account"
      />

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          accessible={true}
          accessibilityRole="link"
          accessibilityLabel="Login"
        >
          <Text style={[styles.footerLink, { color: colors.primary }]}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.trustBadge}>
        <ShieldCheck size={16} color={colors.accentGreen} />
        <Text style={[styles.trustText, { color: colors.accentGreen }]}>
          By creating an account you agree to Sevazo Partner Terms
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
    marginBottom: Spacing.xl,
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
    fontSize: 24,
    textAlign: 'center',
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
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  emailInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: 15,
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
    textAlign: 'center',
  },
});

export default RegisterScreen;
