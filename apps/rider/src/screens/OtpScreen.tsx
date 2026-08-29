import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ArrowRight, ShieldCheck, RotateCcw, CheckCircle } from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows, useAppColors } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/Button';
import { otpStringSchema } from '../validation/authValidation';

export const OtpScreen = ({ route, navigation }: any) => {
  const { phone, isRegister = false, email } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);
  const { verifyOtp, sendOtp, isLoading, error, clearError } = useAuthStore();
  const colors = useAppColors();
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    clearError();
    const clean = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    clearError();
    const otpString = otp.join('');
    const validation = otpStringSchema.safeParse(otpString);
    if (!validation.success) {
      Alert.alert('Invalid OTP', validation.error.errors[0]?.message);
      return;
    }

    const cleanPhone = phone ? phone.replace('+91', '').trim() : '';
    const res = await verifyOtp(cleanPhone, otpString);

    if (res?.accessToken || res) {
      setVerifiedSuccess(true);
      setTimeout(() => {
        const isApproved =
          res?.status === 'APPROVED' ||
          (res as any)?.approvalStatus === 'APPROVED' ||
          res?.rider?.approvalStatus === 'APPROVED' ||
          res?.rider?.status === 'active' ||
          res?.rider?.status === 'ACTIVE' ||
          res?.nextAction === 'OPEN_HOME';

        if (isApproved) {
          // If approved by admin, redirect straight to Rider Dashboard
          navigation.replace('Main');
        } else if (isRegister && res?.isNewUser) {
          navigation.replace('OnboardingPersonal', {
            phone: cleanPhone,
            email: email || '',
          });
        } else if (res?.nextAction === 'RESUME_REGISTRATION') {
          navigation.replace('OnboardingResume');
        } else if (res?.nextAction === 'OPEN_VERIFICATION_STATUS' || res?.status === 'UNDER_REVIEW') {
          navigation.replace('ApplicationStatus');
        } else {
          navigation.replace('Main');
        }
      }, 600);
    }
  };

  const handleResend = async () => {
    clearError();
    const cleanPhone = phone ? phone.replace('+91', '').trim() : '';
    const res = await sendOtp(cleanPhone);
    if (res.success) {
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      Alert.alert('OTP Sent', 'A new verification code has been sent.');
    }
  };

  const formatTimerSeconds = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isOtpComplete = otp.every((digit) => digit.length === 1);

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
          accessibilityLabel="OTP Security icon"
        >
          <ShieldCheck size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Verify your mobile number</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter the 6-digit OTP sent to <Text style={[styles.phoneHighlight, { color: colors.primary }]}>{phone}</Text>
        </Text>
      </View>

      {/* OTP 6-Digit Row */}
      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            style={[
              styles.otpBox,
              {
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                borderColor: digit ? colors.primary : colors.border,
                color: colors.textPrimary,
              },
              digit ? styles.otpBoxFilled : null,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            accessible={true}
            accessibilityLabel={`Digit ${index + 1} of 6`}
          />
        ))}
      </View>

      {error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}

      {verifiedSuccess ? (
        <View style={styles.successBanner} accessible={true} accessibilityRole="alert">
          <CheckCircle size={20} color={colors.accentGreen} />
          <Text style={[styles.successText, { color: colors.accentGreen }]}>
            Mobile Number Verified Successfully!
          </Text>
        </View>
      ) : null}

      <Button
        title="Verify"
        variant="primary"
        size="large"
        onPress={handleVerify}
        isLoading={isLoading}
        disabled={!isOtpComplete || isLoading || verifiedSuccess}
        rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
        accessibilityLabel="Verify OTP"
      />

      <View style={styles.resendRow}>
        {timer > 0 ? (
          <Text style={[styles.timerText, { color: colors.textSecondary }]}>
            Resend code in {formatTimerSeconds(timer)}
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Resend OTP code"
          >
            <RotateCcw size={16} color={colors.primary} />
            <Text style={[styles.resendText, { color: colors.primary }]}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.demoHint}
        onPress={() => {
          setOtp(['1', '2', '3', '4', '5', '6']);
          clearError();
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.demoHintText,
            {
              backgroundColor: isDark ? colors.surface : '#F1F5F9',
              color: colors.textSecondary,
            },
          ]}
        >
          Test mode OTP: 123456 (Tap to autofill)
        </Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
  phoneHighlight: {
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    ...Shadows.card,
  },
  otpBoxFilled: {},
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: '#ECFDF5',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  successText: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: Spacing.md,
    ...Typography.bodySmall,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  timerText: {
    ...Typography.bodySmall,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  resendText: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  demoHint: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  demoHintText: {
    ...Typography.bodySmall,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    fontWeight: '600',
  },
});

export default OtpScreen;
