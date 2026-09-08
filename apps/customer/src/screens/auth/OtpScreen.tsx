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
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Pencil,
  ShieldCheck,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');
// Responsive OTP box width (scaled up for spacious and comfortable input)
const OTP_BOX_SIZE = Math.min(52, Math.floor((Math.min(width, 440) - 80) / 6));

export const OtpScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const phone = route.params?.phone || '';
  const email = route.params?.email || '';
  const mode = route.params?.mode || 'LOGIN';

  // Display destination: phone if present, otherwise email
  const displayTarget = phone || email || '+91 9876543210';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);

  const { verifyOtp, sendOtp, isLoading } = useAuthStore();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
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

    // Handle full 6-digit paste
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const cleanDigit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanDigit;
    setOtp(newOtp);

    // Auto-advance to next box
    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit verification code');
      triggerShake();
      return;
    }

    if (attempts >= 5) {
      setError('Too many incorrect attempts. Please request a new code.');
      triggerShake();
      return;
    }

    setError('');
    try {
      const response = await verifyOtp(phone, fullOtp, email, mode);

      if (response.nextAction === 'OPEN_HOME' || response.profileCompleted) {
        navigation.replace('Main');
      } else {
        // First time user / Location registration
        navigation.replace('RegisterLocation');
      }
    } catch {
      setAttempts((prev) => prev + 1);
      setError('Invalid verification code. Please try again.');
      triggerShake();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isLoading) return;
    setTimer(30);
    setAttempts(0);
    setError('');
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    await sendOtp(phone, email);
  };

  const isOtpComplete = otp.join('').length === 6;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4EC" />
      
      {/* Light Indian Pastel Gradient Background */}
      <LinearGradient
        colors={['#FFF4EC', '#FFE8D6', '#FFFDF9', '#FFFFFF', '#F0FDF4', '#DCFCE7']}
        locations={[0, 0.22, 0.45, 0.65, 0.85, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Header Bar with Back Button */}
      <View
        style={[
          styles.topHeaderBar,
          { paddingTop: insets.top > 0 ? insets.top + Spacing.xs : Spacing.md },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      {/* Centered Scroll Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top > 0 ? insets.top + 50 : 70,
            paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.md : Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.centeredCard,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          {/* Subtle Tricolor Ribbon Bar */}
          <View style={styles.tricolorBar}>
            <View style={[styles.tricolorSegment, { backgroundColor: '#FF9933' }]} />
            <View style={[styles.tricolorSegment, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.tricolorSegment, { backgroundColor: '#138808' }]} />
          </View>

          {/* Clean Sevazo Logo */}
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.brandLogoImg}
            resizeMode="contain"
          />

          {/* Headline */}
          <Text style={styles.mainTitle}>Verification Code</Text>

          {/* Subtitle */}
          <Text style={styles.subText}>
            Please enter the 6-digit verification code sent to
          </Text>

          {/* Destination Chip with Edit Button */}
          <View style={styles.destinationChip}>
            <Text style={styles.destinationText} numberOfLines={1}>
              {displayTarget}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              style={styles.editBtn}
            >
              <Pencil size={13} color="#FF7700" />
              <Text style={styles.editText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* 6-Box Responsive OTP Inputs */}
          <View style={styles.otpInputRow}>
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
                autoFocus={idx === 0}
              />
            ))}
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorRow}>
              <AlertCircle size={15} color={Colors.danger} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Action Submit Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleVerify}
            disabled={isLoading || !isOtpComplete}
            style={[
              styles.verifyBtn,
              (!isOtpComplete || isLoading) && styles.verifyBtnDisabled,
            ]}
          >
            <CheckCircle2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.verifyBtnText}>
              {isLoading ? 'Verifying Code...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>

          {/* Resend Code Section */}
          <View style={styles.resendContainer}>
            <RotateCcw
              size={14}
              color={timer > 0 ? '#94A3B8' : '#FF7700'}
              style={{ marginRight: 6 }}
            />
            {timer > 0 ? (
              <Text style={styles.timerPrompt}>
                Resend code in <Text style={styles.timerHighlight}>{timer}s</Text>
              </Text>
            ) : (
              <View style={styles.resendActionRow}>
                <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Security Badge */}
          <View style={styles.securityRow}>
            <ShieldCheck size={14} color="#138808" style={{ marginRight: 5 }} />
            <Text style={styles.securityText}>Secured with 256-bit encryption</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4EC',
    overflow: 'hidden',
  },
  topHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...Shadows.small,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  centeredCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    paddingHorizontal: Spacing.xl + 4,
    paddingTop: Spacing.xl + 4,
    paddingBottom: Spacing.xl + 4,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...Shadows.elevated,
  },
  tricolorBar: {
    flexDirection: 'row',
    width: 60,
    height: 4.5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  tricolorSegment: {
    flex: 1,
    height: '100%',
  },
  brandLogoImg: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  mainTitle: {
    ...Typography.titleLarge,
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  destinationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 9999,
    paddingVertical: 7,
    paddingHorizontal: Spacing.md + 4,
    marginBottom: Spacing.xl,
  },
  destinationText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 13.5,
    marginRight: Spacing.xs,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  editText: {
    ...Typography.caption,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FF7700',
    marginLeft: 3,
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.lg,
    paddingHorizontal: 2,
  },
  otpBox: {
    width: OTP_BOX_SIZE,
    height: Math.round(OTP_BOX_SIZE * 1.18),
    borderRadius: 14,
    borderWidth: 1.6,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    ...Shadows.small,
  },
  otpBoxFocused: {
    borderColor: '#FF7700',
    backgroundColor: '#FFFDF8',
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
    ...Shadows.medium,
  },
  otpBoxFilled: {
    borderColor: '#138808',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: Spacing.xs + 3,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    width: '100%',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
    fontSize: 12.5,
  },
  verifyBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF7700',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: Spacing.xs,
    ...Shadows.card,
  },
  verifyBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyBtnText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  timerPrompt: {
    ...Typography.caption,
    color: '#64748B',
    fontSize: 13.5,
  },
  timerHighlight: {
    color: '#FF7700',
    fontWeight: '800',
  },
  resendActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendPrompt: {
    ...Typography.caption,
    color: '#64748B',
    fontSize: 13.5,
  },
  resendLink: {
    ...Typography.caption,
    color: '#FF7700',
    fontWeight: '800',
    fontSize: 13.5,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    paddingTop: 4,
    opacity: 0.9,
  },
  securityText: {
    ...Typography.caption,
    fontSize: 11.5,
    color: '#138808',
    fontWeight: '600',
  },
});
