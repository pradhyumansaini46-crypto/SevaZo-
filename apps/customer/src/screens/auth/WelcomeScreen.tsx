import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Shadows } from '../../theme';
import {
  ArrowLeft,
  Mail,
  Check,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Edit2,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

// Medium Orange Theme Color (strictly replacing dark green)
const MEDIUM_ORANGE = '#FF7700';
const SOFT_ORANGE_CONTAINER = '#FFEDD5';
const ORANGE_TEXT_MUTED = '#C2410C';

type ScreenStep = 'form' | 'otp';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { sendOtp, verifyOtp, isLoading, continueAsGuest } = useAuthStore();

  const handleContinueAsGuest = () => {
    triggerHaptic('light');
    continueAsGuest();
    try {
      const parent = navigation.getParent();
      if (parent) {
        parent.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        return;
      }
    } catch {}
    navigation.navigate('Main' as any);
  };

  // Multi-step Section state: 'form' -> Registration, 'otp' -> Send OTP Section
  const [currentStep, setCurrentStep] = useState<ScreenStep>('form');
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // OTP section states
  const [channel, setChannel] = useState<'phone' | 'email'>('phone');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const otpInputRef = useRef<TextInput>(null);

  // Transition animation between Form Section and OTP Section
  const sectionFade = useRef(new Animated.Value(1)).current;
  const sectionSlide = useRef(new Animated.Value(0)).current;

  // Resend OTP countdown timer
  useEffect(() => {
    let countdown: any = null;
    if (currentStep === 'otp') {
      countdown = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (countdown) clearInterval(countdown);
    };
  }, [currentStep]);

  const animateToStep = (targetStep: ScreenStep) => {
    Animated.parallel([
      Animated.timing(sectionFade, {
        toValue: 0,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(sectionSlide, {
        toValue: targetStep === 'otp' ? -18 : 18,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setCurrentStep(targetStep);
      setError('');
      sectionSlide.setValue(targetStep === 'otp' ? 18 : -18);
      Animated.parallel([
        Animated.timing(sectionFade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(sectionSlide, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        if (targetStep === 'otp') {
          otpInputRef.current?.focus();
        }
      });
    });
  };

  const handleTabChange = (tab: 'signup' | 'signin') => {
    if (tab === activeTab) return;
    triggerHaptic('selection');
    setError('');
    setActiveTab(tab);
  };

  const handlePhoneChange = (text: string) => {
    setError('');
    const raw = text.replace(/\D/g, '');
    if (raw.length <= 10) {
      setPhone(raw);
    }
  };

  const handleEmailChange = (text: string) => {
    setError('');
    setEmail(text);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleFormSubmit = async () => {
    triggerHaptic('medium');
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');

    if (activeTab === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name');
        triggerHaptic('error');
        return;
      }
      if (cleanPhone.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        triggerHaptic('error');
        return;
      }
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setError('Please enter a valid email address');
        triggerHaptic('error');
        return;
      }
    } else {
      if (cleanPhone.length !== 10) {
        setError('Please enter your 10-digit phone number');
        triggerHaptic('error');
        return;
      }
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setError('Please enter your registered email address');
        triggerHaptic('error');
        return;
      }
    }

    const formattedPhone = `+91 ${cleanPhone}`;
    const cleanEmail = email.trim().toLowerCase();
    const success = await sendOtp(formattedPhone, cleanEmail);

    if (success) {
      setTimer(30);
      setOtp('');
      animateToStep('otp');
    } else {
      setError('Unable to send verification code. Please check connection.');
      triggerHaptic('error');
    }
  };

  const handleSocialAuth = async (provider: 'Google' | 'Apple') => {
    triggerHaptic('light');
    setPhone('9876543210');
    setEmail(`user_${provider.toLowerCase()}@sevazo.in`);
    setTimer(30);
    setOtp('');
    animateToStep('otp');
  };

  const handleOtpChange = (text: string) => {
    setError('');
    const raw = text.replace(/\D/g, '').slice(0, 6);
    setOtp(raw);
    if (raw.length > otp.length) {
      triggerHaptic('light');
    }
  };

  const handleChannelChange = (newChannel: 'phone' | 'email') => {
    if (newChannel === channel) return;
    triggerHaptic('selection');
    setChannel(newChannel);
    setError('');
    setOtp('');
    otpInputRef.current?.focus();
  };

  const handleOtpConfirm = async () => {
    triggerHaptic('medium');
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit verification code');
      triggerHaptic('error');
      return;
    }

    setError('');
    const formattedPhone = `+91 ${phone.replace(/\D/g, '')}`;
    const cleanEmail = email.trim().toLowerCase();

    try {
      const isNewUser = activeTab === 'signup';
      await verifyOtp(
        formattedPhone,
        otp,
        channel === 'email' ? cleanEmail : undefined,
        isNewUser ? 'REGISTER' : 'LOGIN'
      );
      triggerHaptic('success');

      if (isNewUser) {
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
    const formattedPhone = `+91 ${phone.replace(/\D/g, '')}`;
    await sendOtp(formattedPhone, email.trim().toLowerCase());
    otpInputRef.current?.focus();
  };

  const isFormValid =
    activeTab === 'signup'
      ? fullName.trim().length > 0 && phone.length === 10 && emailRegex.test(email.trim())
      : phone.length === 10 && emailRegex.test(email.trim());

  const isOtpValid = otp.length === 6;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      {/* Light Orange & Soft Greenish Touch Theme Gradient */}
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
            if (currentStep === 'otp') {
              animateToStep('form');
            } else {
              navigation.goBack();
            }
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
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: sectionFade,
              transform: [{ translateY: sectionSlide }],
            },
          ]}
        >
          {currentStep === 'form' ? (
            /* ======================================================== */
            /* SECTION 1: SEVAZO REGISTRATION FORM (Sign Up / Sign In) */
            /* ======================================================== */
            <View style={styles.formCard}>
              {/* Header Title & Subtitle: SevaZo Registration */}
              <Text style={styles.pageTitle}>SevaZo Registration</Text>
              <Text style={styles.pageSubtitle}>
                {activeTab === 'signup'
                  ? "The SevaZo app's sign-up is quick with basic fields to get your deliveries started."
                  : 'Log in to oversee your deliveries, track active orders, and shop local stores.'}
              </Text>

              {/* Segmented Toggle Pill: "Sign Up" & "Sign In" with Medium Orange Active Fill */}
              <View style={styles.segmentedPillContainer}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleTabChange('signup')}
                  style={[
                    styles.segmentBtn,
                    activeTab === 'signup' && styles.segmentBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      activeTab === 'signup' && styles.segmentBtnTextActive,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleTabChange('signin')}
                  style={[
                    styles.segmentBtn,
                    activeTab === 'signin' && styles.segmentBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      activeTab === 'signin' && styles.segmentBtnTextActive,
                    ]}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields Container */}
              <View style={styles.fieldsContainer}>
                {/* 1. Full Name (only in Sign Up mode) */}
                {activeTab === 'signup' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Full Name"
                        placeholderTextColor="#94A3B8"
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                )}

                {/* 2. Phone Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.phonePrefix}>+91</Text>
                    <TextInput
                      style={[styles.textInput, { paddingLeft: 4 }]}
                      placeholder="Phone Number"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={handlePhoneChange}
                    />
                  </View>
                </View>

                {/* 3. Email Field (replaces Password field) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={
                        activeTab === 'signup'
                          ? 'name@example.com'
                          : 'Enter registered email'
                      }
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={handleEmailChange}
                    />
                    <Mail size={18} color="#94A3B8" style={{ marginRight: 4 }} />
                  </View>
                </View>

                {/* Remember Me Option */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setRememberMe(!rememberMe)}
                    style={styles.rememberMeWrap}
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        rememberMe && styles.checkboxBoxActive,
                      ]}
                    >
                      {rememberMe && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                    <Text style={styles.rememberMeText}>Remember this device</Text>
                  </TouchableOpacity>
                </View>

                {/* Error Banner */}
                {error ? (
                  <View style={styles.errorBanner}>
                    <AlertCircle size={14} color={Colors.danger} style={{ marginRight: 6 }} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Medium Orange Solid CTA Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleFormSubmit}
                  disabled={isLoading || !isFormValid}
                  style={[
                    styles.primaryCtaBtn,
                    (!isFormValid || isLoading) && styles.primaryCtaBtnDisabled,
                  ]}
                >
                  {isLoading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={[styles.primaryCtaText, { marginLeft: 8 }]}>
                        Sending Code...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.primaryCtaText}>
                      {activeTab === 'signup' ? 'Sign Up' : 'Log In'}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* OR Divider Line */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons: Google & Apple */}
                <View style={styles.socialRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSocialAuth('Google')}
                    style={styles.socialBtn}
                  >
                    <Text style={styles.socialIconText}>G</Text>
                    <Text style={styles.socialBtnText}>Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSocialAuth('Apple')}
                    style={styles.socialBtn}
                  >
                    <Text style={styles.socialIconText}></Text>
                    <Text style={styles.socialBtnText}>Apple</Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom Footer Switch Link */}
                <View style={styles.footerLinkRow}>
                  <Text style={styles.footerPromptText}>
                    {activeTab === 'signup'
                      ? 'Already have an account? '
                      : "Haven't any account? "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleTabChange(activeTab === 'signup' ? 'signin' : 'signup')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.footerActionText}>
                      {activeTab === 'signup' ? 'Sign In' : 'Sign Up'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Explore Marketplace as Guest */}
                <TouchableOpacity
                  onPress={handleContinueAsGuest}
                  activeOpacity={0.7}
                  style={styles.guestLinkBtn}
                >
                  <Text style={styles.guestLinkText}>Explore Marketplace as Guest →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ======================================================== */
            /* SECTION 2: SEND OTP SECTION (Elevated & Well-Structured) */
            /* ======================================================== */
            <View style={styles.otpSectionCard}>
              {/* Section Header Title & Subtitle (Spacious & Mobile Number Removed) */}
              <Text style={styles.pageTitle}>Send OTP</Text>
              <Text style={styles.pageSubtitle}>
                {channel === 'phone'
                  ? 'An SMS verification code has been sent'
                  : 'A verification code has been sent'}
              </Text>

              {/* Destination Contact in List Form with Edit Button */}
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
                      {channel === 'phone' ? `+91 ${phone}` : email}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => animateToStep('form')}
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
              <View style={styles.fieldsContainer}>
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
                  onPress={() => otpInputRef.current?.focus()}
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
                  ref={otpInputRef}
                  style={styles.hiddenInput}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={handleOtpChange}
                  textContentType="oneTimeCode"
                />

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
                  onPress={handleOtpConfirm}
                  disabled={isLoading || !isOtpValid}
                  style={[
                    styles.primaryCtaBtn,
                    (!isOtpValid || isLoading) && styles.primaryCtaBtnDisabled,
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

                {/* Back to Form Link */}
                <View style={styles.footerLinkRow}>
                  <Text style={styles.footerPromptText}>Need to change your details? </Text>
                  <TouchableOpacity
                    onPress={() => animateToStep('form')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.footerActionText}>Edit Info</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
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
    paddingTop: 10,
    alignItems: 'center',
  },
  animatedContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  formCard: {
    width: '100%',
    alignItems: 'center',
  },
  otpSectionCard: {
    width: '100%',
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
  pageTitle: {
    ...Typography.hero,
    fontSize: 27,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  pageSubtitle: {
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
    paddingVertical: 10,
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
    fontSize: 14,
    fontWeight: '700',
    color: ORANGE_TEXT_MUTED,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  fieldsContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: Spacing.md,
    ...Shadows.small,
  },
  phonePrefix: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
    height: '100%',
    padding: 0,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  rememberMeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxBoxActive: {
    backgroundColor: MEDIUM_ORANGE,
    borderColor: MEDIUM_ORANGE,
  },
  rememberMeText: {
    ...Typography.caption,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
    marginBottom: Spacing.sm,
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
    marginTop: Spacing.xs,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginHorizontal: Spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    height: 48,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  socialIconText: {
    fontSize: 17,
    fontWeight: '900',
    marginRight: 8,
    color: '#0F172A',
  },
  socialBtnText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
  guestLinkBtn: {
    marginTop: Spacing.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  guestLinkText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: MEDIUM_ORANGE,
  },
});
