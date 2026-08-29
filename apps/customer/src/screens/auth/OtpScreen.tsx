import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

export const OtpScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const phone = route.params?.phone || '+91 9876543210';
  const mode = route.params?.mode || 'LOGIN';

  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [timer, setTimer] = useState(30);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const { verifyOtp, sendOtp, isLoading } = useAuthStore();
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    if (attempts >= 4) {
      setError('Too many incorrect attempts. Please request a new OTP.');
      return;
    }

    setError('');
    const response = await verifyOtp(phone, fullOtp, mode);

    if (response.nextAction === 'OPEN_HOME') {
      navigation.replace('Main');
    } else {
      navigation.replace('RegisterProfile');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setTimer(30);
    setAttempts(0);
    setError('');
    await sendOtp(phone);
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top + Spacing.sm : Spacing.md,
          paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.md : Spacing.lg,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Code</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.infoTitle}>
          {mode === 'REGISTER' ? 'Verify to Create Account' : 'Verify Mobile Number'}
        </Text>
        <Text style={styles.infoSubtitle}>
          We have sent a 6-digit verification code to{' '}
          <Text style={styles.phoneHighlight}>{phone}</Text>
        </Text>

        {/* 6 Digit OTP inputs */}
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => {
                inputRefs.current[idx] = ref;
              }}
              style={[styles.otpBox, !!digit && styles.otpBoxFilled]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <ShieldAlert size={16} color={Colors.danger} style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          loading={isLoading}
          icon={<CheckCircle2 size={18} color={Colors.textInverse} />}
          size="lg"
          style={styles.verifyBtn}
        />

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.md,
  },
  headerTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevated,
  },
  infoTitle: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  infoSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    ...Typography.titleLarge,
    color: Colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  verifyBtn: {
    marginTop: Spacing.sm,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  resendText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  timerText: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  resendLink: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '800',
  },
});
