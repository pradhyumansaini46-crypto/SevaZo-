import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  ShieldAlert,
  RotateCcw,
  Edit3,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

export const OtpScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const phone = route.params?.phone || '+91 9876543210';
  const email = route.params?.email || 'user@example.com';
  const mode = route.params?.mode || 'LOGIN';

  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [timer, setTimer] = useState(30);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);

  const { verifyOtp, sendOtp, isLoading } = useAuthStore();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleOtpChange = (value: string, index: number) => {
    setError('');
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
      triggerShake();
      return;
    }

    if (attempts >= 5) {
      setError('Too many incorrect attempts. Please request a new OTP.');
      triggerShake();
      return;
    }

    setError('');
    try {
      const response = await verifyOtp(phone, fullOtp, email, mode);

      if (response.nextAction === 'OPEN_HOME' || response.profileCompleted) {
        navigation.replace('Main');
      } else {
        // First time user / No address registered -> Ask for Location & Address
        navigation.replace('RegisterLocation');
      }
    } catch {
      setAttempts((prev) => prev + 1);
      setError('Invalid OTP code. Please try again or use 123456.');
      triggerShake();
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setTimer(30);
    setAttempts(0);
    setError('');
    await sendOtp(phone, email);
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
      <StatusBar barStyle="light-content" backgroundColor="#FF9933" />
      
      {/* Indian Tricolor Full Page Linear Gradient */}
      <LinearGradient
        colors={['#FF9933', '#FFA756', '#FFFFFF', '#FFFFFF', '#E6F4EA', '#138808']}
        locations={[0, 0.18, 0.42, 0.62, 0.85, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Email Verification</Text>
      </View>

      <Animated.View
        style={[
          styles.contentWrap,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Email Badge Box */}
        <View style={styles.emailBadgeCard}>
          <View style={styles.emailIconCircle}>
            <Mail size={22} color="#FF7700" />
          </View>
          <View style={styles.emailTextWrap}>
            <Text style={styles.emailBadgeLabel}>Code sent to your email</Text>
            <Text style={styles.emailAddressText} numberOfLines={1}>
              {email}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.editEmailBtn}
          >
            <Edit3 size={14} color="#FF7700" />
            <Text style={styles.editEmailText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Card with OTP digits */}
        <Animated.View
          style={[
            styles.card,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          <Text style={styles.cardTitle}>Enter 6-Digit Code</Text>
          <Text style={styles.cardSubtitle}>
            Check your inbox and spam folder for the 6-digit confirmation code.
          </Text>

          {/* 6 Digit OTP inputs */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => {
                  inputRefs.current[idx] = ref;
                }}
                style={[
                  styles.otpBox,
                  focusedIndex === idx && styles.otpBoxFocused,
                  !!digit && styles.otpBoxFilled,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onFocus={() => setFocusedIndex(idx)}
                onBlur={() => setFocusedIndex(null)}
                onChangeText={(text) => handleOtpChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <ShieldAlert size={16} color={Colors.danger} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Verify & Proceed Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleVerify}
            disabled={isLoading || otp.join('').length < 6}
            style={[
              styles.verifyBtn,
              (otp.join('').length < 6 || isLoading) && styles.verifyBtnDisabled,
            ]}
          >
            <CheckCircle2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.verifyBtnText}>
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>

          {/* Resend Code Section */}
          <View style={styles.resendRow}>
            <RotateCcw size={14} color={timer > 0 ? '#94A3B8' : '#FF7700'} style={{ marginRight: 6 }} />
            <Text style={styles.resendText}>Didn't receive email? </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF9933',
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs + 2,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: Spacing.sm,
  },
  headerTitle: {
    ...Typography.titleMedium,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  contentWrap: {
    flex: 1,
  },
  emailBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  emailIconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    ...Shadows.small,
  },
  emailTextWrap: {
    flex: 1,
  },
  emailBadgeLabel: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  emailAddressText: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  editEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  editEmailText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#FF7700',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.elevated,
  },
  cardTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    ...Typography.titleLarge,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  otpBoxFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    ...Shadows.small,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
    ...Shadows.medium,
  },
  verifyBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyBtnText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resendText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  timerText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  resendLink: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '800',
  },
});

