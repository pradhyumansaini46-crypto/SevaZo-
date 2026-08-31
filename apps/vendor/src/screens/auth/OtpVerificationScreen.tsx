import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ArrowLeft, ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows, Spacing } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/Button';
import { VendorApi } from '../../services/vendorApi';
import { normalizeApiError, formatPhone } from '../../utils';

export const OtpVerificationScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';
  const { setAuth } = useAuthStore();

  const phone = route.params?.phone || '9876543210';
  const email = route.params?.email;
  const isRegister = Boolean(route.params?.isRegister);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');

    // Handle full 6-digit paste
    if (cleaned.length === 6 && index === 0) {
      const split = cleaned.split('');
      setOtp(split);
      setError(undefined);
      inputRefs.current[5]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned ? cleaned[cleaned.length - 1] : '';
    setOtp(newOtp);
    setError(undefined);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError(undefined);

    try {
      if (isRegister && email) {
        await VendorApi.registerOtp({ phone, email });
      } else {
        await VendorApi.sendOtp(phone);
      }
      setTimer(30);
      setCanResend(false);
      Alert.alert('OTP Sent', `A fresh 6-digit verification code was sent to ${formatPhone(phone)}.`);
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      if (normalized.code === 'RATE_LIMIT_EXCEEDED' || normalized.statusCode === 429) {
        setError('Too many OTP attempts. Please wait a few minutes before resending.');
      } else {
        setError(normalized.message || 'Failed to resend OTP.');
      }
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      let response: any;
      if (isRegister && email) {
        response = await VendorApi.verifyRegisterOtp({
          phone,
          email,
          otp: enteredOtp,
        });
      } else {
        response = await VendorApi.verifyOtp(phone, enteredOtp);
      }

      const accessToken = response.accessToken || response.token;
      const refreshToken = response.refreshToken || '';
      const vendor = response.vendor;
      const backendStatus = response.status || vendor?.status || 'DRAFT';

      // Persist authenticated session
      await setAuth(
        accessToken,
        refreshToken,
        vendor,
        response.nextAction,
        response.completionPercentage
      );

      // Route strictly according to backend-determined status
      switch (backendStatus) {
        case 'NO_VENDOR':
          navigation.replace('Welcome');
          break;
        case 'DRAFT':
          navigation.replace('OnboardingWizard', { initialStep: response.currentStep || 1 });
          break;
        case 'SUBMITTED':
        case 'UNDER_REVIEW':
          navigation.replace('StatusTracker');
          break;
        case 'APPROVED':
        case 'ACTIVE':
          navigation.replace('Main');
          break;
        case 'REJECTED':
          navigation.replace('Correction');
          break;
        case 'SUSPENDED':
          navigation.replace('Suspended');
          break;
        default:
          navigation.replace('OnboardingWizard');
          break;
      }
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      setError(normalized.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.background : '#FFFFFF' }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Hero Content */}
          <View style={styles.heroSection}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255, 102, 0, 0.15)' : '#FFF7ED', borderColor: '#FF6600' }]}>
              <ShieldCheck size={32} color="#FF6600" />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Verify OTP</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter the 6-digit code sent to{' '}
              <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{formatPhone(phone)}</Text>
            </Text>
          </View>

          {/* 6-Digit OTP Box Grid */}
          <View style={styles.otpGrid}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: isDark ? colors.surface : '#FFFFFF',
                    borderColor: digit
                      ? '#FF6600'
                      : error
                      ? colors.danger
                      : colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                autoFocus={index === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Timer & Resend Button */}
          <View style={styles.timerRow}>
            {timer > 0 ? (
              <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                Resend code in <Text style={{ fontWeight: '700', color: colors.textPrimary }}>00:{timer < 10 ? `0${timer}` : timer}</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                style={styles.resendBtn}
              >
                <RotateCw size={14} color="#FF6600" />
                <Text style={[styles.resendText, { color: '#FF6600' }]}>
                  {resending ? 'Sending OTP...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify CTA */}
          <Button
            title="Verify & Continue"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!isComplete || loading}
            onPress={handleVerify}
            rightIcon={<CheckCircle2 size={18} color="#FFFFFF" />}
            style={styles.verifyBtn}
          />

          {/* Quick Demo Hint */}
          <View style={[styles.hintCard, { backgroundColor: isDark ? colors.surface : '#F1F5F9', borderColor: colors.border }]}>
            <ShieldCheck size={16} color="#FF6600" />
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
              Demo environment verification code: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>123456</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
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
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Shadows.glowOrange,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 18,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    ...Shadows.card,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: 10,
    borderRadius: BorderRadius.md,
    marginBottom: 12,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 13,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
  },
  verifyBtn: {
    marginBottom: 14,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  hintText: {
    fontSize: 12,
    flex: 1,
  },
});

export default OtpVerificationScreen;
