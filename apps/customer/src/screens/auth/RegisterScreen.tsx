import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import { Phone, Mail, Gift, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { sendOtp, updateRegistrationDraft, isLoading } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError(null);
    const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? `+${cleanPhone}`
      : `+91 ${cleanPhone.slice(-10)}`;

    updateRegistrationDraft({
      phone: formattedPhone,
      email: email.trim(),
    });

    const sent = await sendOtp(formattedPhone);
    if (sent) {
      navigation.navigate('Otp', { phone: formattedPhone, mode: 'REGISTER' });
    } else {
      setError('Failed to send verification code. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top + Spacing.sm : Spacing.md,
          paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.md : Spacing.lg,
        },
      ]}
    >
      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.stepBadge}>Step 1 of 4: Mobile Verification</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Titles */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to get started with Sevazo Express.
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formContainer}>
          {/* Mobile Number Input */}
          <Text style={styles.inputLabel}>
            Mobile Number <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={[styles.inputRow, !!error && styles.inputRowError]}>
            <View style={styles.prefixWrap}>
              <Text style={styles.flagEmoji}>🇮🇳</Text>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <View style={styles.dividerVertical} />
            <TextInput
              style={styles.textInput}
              placeholder="98765 43210"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={11}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (error) setError(null);
              }}
            />
          </View>

          {/* Email Address Input (Optional) */}
          <Text style={styles.inputLabel}>
            Email Address <Text style={styles.optionalTag}>(Optional for e-bills)</Text>
          </Text>
          <View style={styles.standardInputRow}>
            <Mail size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.standardTextInput}
              placeholder="name@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Referral Code Input (Optional) */}
          <Text style={styles.inputLabel}>
            Referral Code <Text style={styles.optionalTag}>(Optional: Get ₹100 Wallet Credit)</Text>
          </Text>
          <View style={styles.standardInputRow}>
            <Gift size={18} color={Colors.primary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.standardTextInput}
              placeholder="e.g. SEVAZO100"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              value={referralCode}
              onChangeText={setReferralCode}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Value Assurance Card */}
          <View style={styles.assuranceCard}>
            <ShieldCheck size={16} color={Colors.success} style={{ marginRight: 8 }} />
            <Text style={styles.assuranceText}>
              We will send a 6-digit OTP to verify your mobile number.
            </Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionBlock}>
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={isLoading}
            size="lg"
            style={styles.continueBtn}
          />

          <View style={styles.loginPromptRow}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  stepBadge: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  headerBlock: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.titleLarge,
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  formContainer: {
    gap: Spacing.md,
  },
  inputLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  requiredStar: {
    color: Colors.danger,
  },
  optionalTag: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputRowError: {
    borderColor: Colors.danger,
    backgroundColor: '#FEF2F2',
  },
  prefixWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  prefixText: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dividerVertical: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  textInput: {
    flex: 1,
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  standardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  standardTextInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    fontWeight: '600',
    marginTop: 4,
  },
  assuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  assuranceText: {
    flex: 1,
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  actionBlock: {
    marginTop: Spacing.xl * 1.5,
    gap: Spacing.md,
  },
  continueBtn: {
    width: '100%',
  },
  loginPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  loginPromptText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  loginLink: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.primary,
  },
});
