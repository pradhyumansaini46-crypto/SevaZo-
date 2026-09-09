import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Shadows } from '../../theme';
import {
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Mail,
  Edit2,
  CheckCircle2,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

// Medium Orange Theme Color (strictly replacing dark green)
const MEDIUM_ORANGE = '#FF7700';
const SOFT_ORANGE_CONTAINER = '#FFEDD5';
const ORANGE_TEXT_MUTED = '#C2410C';

export const OtpScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const phone = route.params?.phone || '+91 9876543210';
  const emailParam = route.params?.email || 'user@sevazo.in';
  const mode = route.params?.mode || 'LOGIN';

  const [channel, setChannel] = useState<'phone' | 'email'>('phone');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');

  const { verifyOtp, sendOtp, isLoading } = useAuthStore();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleChannelChange = (newChannel: 'phone' | 'email') => {
    if (newChannel === channel) return;
    triggerHaptic('selection');
    setChannel(newChannel);
    setError('');
    setOtp('');
    inputRef.current?.focus();
  };

  const handleOtpChange = (text: string) => {
    setError('');
    const raw = text.replace(/\D/g, '').slice(0, 6);
    setOtp(raw);
    if (raw.length > otp.length) {
      triggerHaptic('light');
    }
  };

  const handleEditDestination = () => {
    triggerHaptic('light');
    navigation.goBack();
  };

  const handleConfirm = async () => {
    triggerHaptic('medium');
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit verification code');
      triggerHaptic('error');
      return;
    }

    setError('');
    try {
      await verifyOtp(
        phone,
        otp,
        channel === 'email' ? emailParam : undefined,
        mode
      );
      triggerHaptic('success');

      if (mode === 'REGISTER') {
        // New user registering -> Show the 3 onboarding steps
        navigation.replace('Onboarding');
      } else {
        // Existing user logging in -> Directly to Main Dashboard
        try {
          const parent = navigation.getParent();
          if (parent) {
            parent.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
            return;
          }
        } catch {
          // fallback
        }
        navigation.navigate('Main' as any);
      }
    } catch {
      setError('Invalid verification code. Please check and try again.');
      triggerHaptic('error');
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isLoading) return;
    triggerHaptic('light');
    setTimer(30);
    setError('');
    setOtp('');
    await sendOtp(phone, emailParam);
    inputRef.current?.focus();
  };

  const isFormValid = otp.length === 6;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      {/* Light Orange & Soft Greenish Touch Gradient Background */}
      <LinearGradient
        colors={['#FFF8F0', '#FFF2E6', '#FFFDF9', '#F0FDF4', '#DCFCE7']}
        locations={[0, 0.22, 0.48, 0.8, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Header Bar with Circular Back Button */}
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top > 0 ? insets.top + Spacing.xs : Spacing.md },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            triggerHaptic('light');
            navigation.goBack();
          }}
          style={styles.circularBackBtn}
        >
          <ArrowLeft size={19} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.lg : Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Well-Structured Elevated Section Card */}
        <View style={styles.sectionCard}>
          {/* Section Header Title & Subtitle (Spacious & Mobile Number Removed) */}
          <Text style={styles.sectionTitle}>Send OTP</Text>
          <Text style={styles.sectionSubtitle}>
            {channel === 'phone'
              ? 'An SMS verification code has been sent'
              : 'A verification code has been sent'}
          </Text>

          {/* Destination Contact in List Form with Edit Option */}
          <View style={styles.destinationListCard}>
            <View style={styles.destinationListItem}>
              <View style={styles.listIconContainer}>
                {channel === 'phone' ? (
                  <Smartphone size={20} color={MEDIUM_ORANGE} />
                ) : (
                  <Mail size={20} color={MEDIUM_ORANGE} />
                )}
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listLabel}>
                  {channel === 'phone' ? 'Mobile Number' : 'Email Address'}
                </Text>
                <Text style={styles.listValue}>
                  {channel === 'phone' ? phone : emailParam}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleEditDestination}
                style={styles.listEditBtn}
              >
                <Edit2 size={13} color={MEDIUM_ORANGE} style={{ marginRight: 4 }} />
                <Text style={styles.listEditText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Segmented Pill Toggle: "Phone" | "Email" in Medium Orange */}
          <View style={styles.segmentedPillContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleChannelChange('phone')}
              style={[
                styles.segmentBtn,
                channel === 'phone' && styles.segmentBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentBtnText,
                  channel === 'phone' && styles.segmentBtnTextActive,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleChannelChange('email')}
              style={[
                styles.segmentBtn,
                channel === 'email' && styles.segmentBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentBtnText,
                  channel === 'email' && styles.segmentBtnTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* 6-Digit OTP Box Grid */}
          <View style={styles.otpSection}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>OTP Number</Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <TouchableOpacity activeOpacity={0.7} onPress={handleResend}>
                  <Text style={styles.resendText}>Resend code</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Interactive 6-Digit Box Display */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={styles.boxesRow}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const digit = otp[index] || '';
                const isFocused = otp.length === index;
                const isFilled = Boolean(digit);

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      isFilled && styles.otpBoxFilled,
                      isFocused && styles.otpBoxFocused,
                    ]}
                  >
                    <Text style={styles.digitText}>{digit}</Text>
                    {isFocused && <View style={styles.activeCursor} />}
                  </View>
                );
              })}
            </TouchableOpacity>

            {/* Hidden Input Layer for native keyboard & SMS auto-fill */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={handleOtpChange}
              autoFocus
              textContentType="oneTimeCode"
            />
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={14} color={Colors.danger} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Medium Orange Solid CTA Button: "Confirm" */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleConfirm}
            disabled={isLoading || !isFormValid}
            style={[
              styles.primaryCtaBtn,
              (!isFormValid || isLoading) && styles.primaryCtaBtnDisabled,
            ]}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={[styles.primaryCtaText, { marginLeft: 8 }]}>Verifying...</Text>
              </View>
            ) : (
              <Text style={styles.primaryCtaText}>Confirm</Text>
            )}
          </TouchableOpacity>

          {/* Bottom Footer Switch Link */}
          <View style={styles.footerLinkRow}>
            <Text style={styles.footerPromptText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                navigation.goBack();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.footerActionText}>Sign In</Text>
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
    backgroundColor: '#FFF8F0',
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xs,
    zIndex: 10,
  },
  circularBackBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    alignItems: 'center',
  },
  sectionCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 0,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    ...Shadows.card,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  sectionTitle: {
    ...Typography.hero,
    fontSize: 27,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: Spacing.xs,
    marginBottom: 24,
    fontWeight: '500',
  },
  destinationListCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 22,
    ...Shadows.small,
  },
  destinationListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  listIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  listEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  listEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: MEDIUM_ORANGE,
  },
  segmentedPillContainer: {
    flexDirection: 'row',
    backgroundColor: SOFT_ORANGE_CONTAINER,
    borderRadius: 22,
    padding: 4,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: MEDIUM_ORANGE,
    ...Shadows.small,
  },
  segmentBtnText: {
    ...Typography.bodyMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: ORANGE_TEXT_MUTED,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  otpSection: {
    width: '100%',
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputLabel: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  timerText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  resendText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: MEDIUM_ORANGE,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  otpBox: {
    flex: 1,
    maxWidth: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  otpBoxFilled: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  otpBoxFocused: {
    borderColor: MEDIUM_ORANGE,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    ...Shadows.small,
  },
  digitText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  activeCursor: {
    position: 'absolute',
    bottom: 10,
    width: 14,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: MEDIUM_ORANGE,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    marginBottom: Spacing.md,
    width: '100%',
  },
  errorText: {
    ...Typography.caption,
    fontSize: 12.5,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  primaryCtaBtn: {
    backgroundColor: MEDIUM_ORANGE,
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
    ...Shadows.card,
  },
  primaryCtaBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryCtaText: {
    ...Typography.bodyLarge,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerPromptText: {
    ...Typography.bodySmall,
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
  },
  footerActionText: {
    ...Typography.bodySmall,
    fontSize: 13.5,
    color: MEDIUM_ORANGE,
    fontWeight: '800',
  },
});
