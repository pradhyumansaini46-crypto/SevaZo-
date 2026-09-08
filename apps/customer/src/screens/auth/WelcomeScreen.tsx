import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Mail, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import {
  MARQUEE_ROW_1,
  MARQUEE_ROW_2,
  MARQUEE_ROW_3,
  MARQUEE_ROW_4,
  MarqueeProduct,
} from './marqueeProducts';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 76;
const ITEM_MARGIN = 10;
const SINGLE_ITEM_FULL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

// Smooth Continuous Moving Row Component
const MarqueeRow: React.FC<{
  items: MarqueeProduct[];
  speed?: number; // duration in ms
  reverse?: boolean;
}> = ({ items, speed = 32000, reverse = false }) => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const rowWidth = items.length * SINGLE_ITEM_FULL_WIDTH;

  useEffect(() => {
    const startAnimation = () => {
      scrollAnim.setValue(reverse ? -rowWidth : 0);
      Animated.loop(
        Animated.timing(scrollAnim, {
          toValue: reverse ? 0 : -rowWidth,
          duration: speed,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimation();
  }, [items.length, reverse, speed, rowWidth]);

  // Triple buffer to guarantee completely gapless continuous loop
  const displayItems = [...items, ...items, ...items];

  return (
    <View style={styles.marqueeRowContainer}>
      <Animated.View
        style={[
          styles.marqueeTrack,
          {
            transform: [{ translateX: scrollAnim }],
          },
        ]}
      >
        {displayItems.map((item, idx) => (
          <View
            key={`${item.id}-${idx}`}
            style={styles.productImageWrapper}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.floatingProductImg}
              resizeMode="contain"
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { sendOtp, isLoading, continueAsGuest } = useAuthStore();

  const [authMode, setAuthMode] = useState<'SIGNUP' | 'LOGIN'>('SIGNUP');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [error, setError] = useState('');

  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length === 10;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  
  // Validation: If SIGNUP, both phone and email are required. If LOGIN, only email is required.
  const isFormValid = authMode === 'SIGNUP' ? isPhoneValid && isEmailValid : isEmailValid;

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

  const handleSubmit = async () => {
    if (authMode === 'SIGNUP') {
      if (!isPhoneValid) {
        setError('Please enter a valid 10-digit mobile number');
        return;
      }
      if (!isEmailValid) {
        setError('Please enter a valid email address');
        return;
      }
    } else {
      if (!isEmailValid) {
        setError('Please enter a valid registered email address');
        return;
      }
    }

    setError('');
    const formattedPhone = authMode === 'SIGNUP' ? `+91 ${cleanPhone}` : '';
    const success = await sendOtp(formattedPhone, email.trim().toLowerCase());

    if (success) {
      navigation.navigate('Otp', {
        phone: formattedPhone || email.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        mode: authMode === 'SIGNUP' ? 'REGISTER' : 'LOGIN',
      });
    } else {
      setError('Failed to send OTP. Please check your network connection.');
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#FF9933" />

      {/* Full Page Indian Tricolor Linear Gradient (Saffron -> White -> Green) */}
      <LinearGradient
        colors={['#FF9933', '#FFA756', '#FFFFFF', '#FFFFFF', '#E6F4EA', '#138808']}
        locations={[0, 0.18, 0.42, 0.62, 0.85, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Floating Skip Login Pill */}
      <View
        style={[
          styles.topHeaderBar,
          { paddingTop: insets.top > 0 ? insets.top + Spacing.xs : Spacing.md },
        ]}
      >
        <View />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleGuestMode}
          style={styles.skipLoginPill}
        >
          <Text style={styles.skipLoginText}>Skip login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.md : Spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Continuous Moving Product Marquee (4 Staggered Rows, 100 Modern Grocery Items) */}
        <View style={styles.marqueeSection}>
          <MarqueeRow items={MARQUEE_ROW_1} speed={28000} reverse={true} />
          <MarqueeRow items={MARQUEE_ROW_2} speed={32000} reverse={false} />
          <MarqueeRow items={MARQUEE_ROW_3} speed={26000} reverse={true} />
          <MarqueeRow items={MARQUEE_ROW_4} speed={30000} reverse={false} />
        </View>

        {/* Bottom Card / Auth Sheet */}
        <View style={styles.bottomCard}>
          {/* Greenish Gradient starting right below "Seva Zo Dil Se Ki Jaye" title */}
          <LinearGradient
            colors={['#FFFFFF', '#FFFFFF', '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC']}
            locations={[0, 0.22, 0.42, 0.65, 0.85, 1]}
            style={styles.bottomCardGradient}
          />

          {/* Subtle Tricolor Ribbon Bar on top of the card */}
          <View style={styles.tricolorBar}>
            <View style={[styles.tricolorSegment, { backgroundColor: '#FF9933' }]} />
            <View style={[styles.tricolorSegment, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.tricolorSegment, { backgroundColor: '#138808' }]} />
          </View>

          {/* Brand Logo Box */}
          <View style={styles.brandBoxWrap}>
            <View style={styles.brandSquare}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.brandLogoImg}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Tagline */}
          <Text style={styles.mainTitle}>Seva Zo Dil Se Ki Jaye</Text>

          {/* Interactive Dual Mode Switch (Sign Up default vs Log In) */}
          <View style={styles.tabSwitchContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setAuthMode('SIGNUP');
                setError('');
              }}
              style={[
                styles.tabSwitchBtn,
                authMode === 'SIGNUP' && styles.tabSwitchBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.tabSwitchText,
                  authMode === 'SIGNUP' && styles.tabSwitchTextActive,
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setAuthMode('LOGIN');
                setError('');
              }}
              style={[
                styles.tabSwitchBtn,
                authMode === 'LOGIN' && styles.tabSwitchBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.tabSwitchText,
                  authMode === 'LOGIN' && styles.tabSwitchTextActive,
                ]}
              >
                Log In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          <View style={styles.formWrap}>
            {/* 1. Mobile Number Input (Shown ONLY in SIGNUP mode) */}
            {authMode === 'SIGNUP' ? (
              <View style={styles.mobileInputRow}>
                {/* Flag Pill */}
                <View style={styles.flagBox}>
                  <Text style={styles.flagText}>🇮🇳</Text>
                  <ChevronDown size={14} color="#64748B" style={{ marginLeft: 2 }} />
                </View>

                {/* Number Input Field */}
                <View
                  style={[
                    styles.numberInputBox,
                    phoneFocused && styles.inputFocused,
                    isPhoneValid && styles.inputValid,
                  ]}
                >
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Mobile number (Mandatory)"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                  />
                  {isPhoneValid ? (
                    <CheckCircle2 size={16} color="#138808" style={styles.validIcon} />
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* 2. Email Address Input */}
            <View
              style={[
                styles.emailInputBox,
                emailFocused && styles.inputFocused,
                isEmailValid && styles.inputValid,
              ]}
            >
              <Mail
                size={18}
                color={emailFocused ? '#FF7700' : '#94A3B8'}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder={authMode === 'SIGNUP' ? "Email address (Mandatory)" : "Enter your email address"}
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={handleEmailChange}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
              {isEmailValid ? (
                <CheckCircle2 size={16} color="#138808" style={styles.validIcon} />
              ) : null}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorRow}>
                <AlertCircle size={14} color={Colors.danger} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* 3. Continue / Action Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSubmit}
              disabled={isLoading || !isFormValid}
              style={[
                styles.continueBtn,
                (!isFormValid || isLoading) && styles.continueBtnDisabled,
              ]}
            >
              <Text style={styles.continueBtnText}>
                {isLoading ? 'Sending OTP...' : authMode === 'SIGNUP' ? 'Create Account' : 'Log In'}
              </Text>
            </TouchableOpacity>

            {/* Single-line Compact Terms & Privacy Policy at bottom (1st letter Capital, rest small) */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText} numberOfLines={1}>
                By continuing, you agree to our terms & privacy policy
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF9933',
  },
  topHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  skipLoginPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipLoginText: {
    ...Typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  marqueeSection: {
    paddingTop: Spacing.xxl * 1.4,
    paddingBottom: Spacing.xs,
    overflow: 'hidden',
  },
  marqueeRowContainer: {
    height: 72,
    marginVertical: 3,
    justifyContent: 'center',
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImageWrapper: {
    width: ITEM_WIDTH,
    height: 68,
    marginHorizontal: ITEM_MARGIN,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  floatingProductImg: {
    width: 64,
    height: 64,
    backgroundColor: 'transparent',
  },
  bottomCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  bottomCardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  tricolorBar: {
    flexDirection: 'row',
    width: 64,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  tricolorSegment: {
    flex: 1,
    height: '100%',
  },
  brandBoxWrap: {
    marginBottom: 2,
  },
  brandSquare: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    ...Shadows.small,
  },
  brandLogoImg: {
    width: 44,
    height: 44,
  },
  mainTitle: {
    ...Typography.titleLarge,
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    borderRadius: 14,
    padding: 3,
    width: '100%',
    marginBottom: Spacing.sm + 2,
  },
  tabSwitchBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  tabSwitchBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.small,
  },
  tabSwitchText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabSwitchTextActive: {
    color: '#FF7700',
    fontWeight: '800',
  },
  formWrap: {
    width: '100%',
  },
  mobileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.sm,
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
    ...Shadows.small,
  },
  flagText: {
    fontSize: 18,
  },
  numberInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: Spacing.md,
    ...Shadows.small,
  },
  countryCode: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  emailInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm + 2,
    ...Shadows.small,
  },
  inputLeftIcon: {
    marginRight: Spacing.sm,
  },
  inputFocused: {
    borderColor: '#FF7700',
    backgroundColor: '#FFFFFF',
  },
  inputValid: {
    borderColor: '#138808',
  },
  textInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: '#0F172A',
    height: '100%',
  },
  validIcon: {
    marginLeft: Spacing.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  continueBtn: {
    backgroundColor: '#FF7700', // Saffron CTA
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...Shadows.card,
  },
  continueBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 15,
  },
  termsContainer: {
    marginTop: Spacing.xs + 4,
    marginBottom: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  termsText: {
    ...Typography.caption,
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
});


