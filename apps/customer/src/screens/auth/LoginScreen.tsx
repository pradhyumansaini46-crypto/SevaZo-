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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import { Phone, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { sendOtp, isLoading } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError(null);
    const fullPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? `+${cleanPhone}`
      : `+91 ${cleanPhone.slice(-10)}`;

    const sent = await sendOtp(fullPhone);
    if (sent) {
      navigation.navigate('Otp', { phone: fullPhone, mode: 'LOGIN' });
    } else {
      setError('Unable to send OTP. Please check your connection.');
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
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Login to Sevazo</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to receive a 6-digit OTP
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={[styles.inputRow, !!error && styles.inputRowError]}>
            <View style={styles.prefixWrap}>
              <Text style={styles.flagEmoji}>🇮🇳</Text>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <View style={styles.dividerVertical} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter 10-digit number"
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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Value Assurance Card */}
          <View style={styles.assuranceCard}>
            <ShieldCheck size={16} color={Colors.success} style={{ marginRight: 8 }} />
            <Text style={styles.assuranceText}>
              A 6-digit one-time password will be sent via SMS.
            </Text>
          </View>

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={isLoading}
            size="lg"
            style={styles.continueBtn}
          />

          {/* Social Logins */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleContinue}
              style={styles.socialBtn}
            >
              <Text style={styles.socialIcon}>🌐</Text>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleContinue}
              style={styles.socialBtn}
            >
              <Text style={styles.socialIcon}></Text>
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Switch to Register */}
        <View style={styles.actionBlock}>
          <View style={styles.registerPromptRow}>
            <Text style={styles.registerPromptText}>New to Sevazo? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Create Account</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
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
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    fontWeight: '600',
  },
  assuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  assuranceText: {
    flex: 1,
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  continueBtn: {
    width: '100%',
    marginTop: Spacing.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    paddingHorizontal: Spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  socialIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  socialText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionBlock: {
    marginTop: Spacing.xl,
  },
  registerPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  registerPromptText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  registerLink: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.primary,
  },
});
