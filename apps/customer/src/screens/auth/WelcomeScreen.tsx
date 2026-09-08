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
  MARQUEE_ROW_5,
  MarqueeProduct,
} from './marqueeProducts';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = 68;
const GRID_ITEM_MARGIN = 5;
const SINGLE_ITEM_FULL_WIDTH = GRID_ITEM_SIZE + GRID_ITEM_MARGIN * 2;

// Smooth Slow Continuous Moving Grid Row Component
const MarqueeRow: React.FC<{
  items: MarqueeProduct[];
  speed?: number; // duration in ms
  reverse?: boolean;
}> = ({ items, speed = 40000, reverse = false }) => {
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
            style={styles.gridCardTile}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.gridProductImg}
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

  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [error, setError] = useState('');

  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length === 10;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  
  // Validation: If signup, both phone and email are required. If login, only email is required.
  const isFormValid = activeTab === 'signup' ? isPhoneValid && isEmailValid : isEmailValid;

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
    if (activeTab === 'signup') {
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
    const formattedPhone = activeTab === 'signup' ? `+91 ${cleanPhone}` : '';
    const success = await sendOtp(formattedPhone, email.trim().toLowerCase());

    if (success) {
      navigation.navigate('Otp', {
        phone: formattedPhone || email.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        mode: activeTab === 'signup' ? 'REGISTER' : 'LOGIN',
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

      {/* Soft Gradient Background (Orange fading into White / Light Green) */}
      <LinearGradient
        colors={['#FF9933', '#FFA756', '#FFFFFF', '#FFFFFF', '#F0FDF4', '#DCFCE7']}
        locations={[0, 0.2, 0.45, 0.65, 0.85, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Right "Skip" Button (Semi-transparent dark pill, white bold text, z-50) */}
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
          style={styles.skipPill}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.sm : Spacing.md,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dynamic Movable 4x4 / 5-Row Stroke-Bordered Product Grid View (4 Rows on signup, 5 Rows on login) */}
        <View style={styles.marqueeSection}>
          {/* Row 1: Grocery - Left to Right */}
          <MarqueeRow items={MARQUEE_ROW_1} speed={38000} reverse={true} />
          {/* Row 2: Dairy - Right to Left */}
          <MarqueeRow items={MARQUEE_ROW_2} speed={42000} reverse={false} />
          {/* Row 3: Electronics - Left to Right */}
          <MarqueeRow items={MARQUEE_ROW_3} speed={36000} reverse={true} />
          {/* Row 4: Personal Care - Right to Left */}
          <MarqueeRow items={MARQUEE_ROW_4} speed={40000} reverse={false} />
          {/* Dynamic 5th Row: Grooming - Rendered only when activeTab === 'login' */}
          {activeTab === 'login' ? (
            <MarqueeRow items={MARQUEE_ROW_5} speed={38000} reverse={true} />
          ) : null}
        </View>

        {/* Auth Form Card with Top Rounded Corners */}
        <View style={styles.bottomCard}>
          {/* Subtle Greenish Gradient Transition starting below Title */}
          <LinearGradient
            colors={['#FFFFFF', '#FFFFFF', '#F0FDF4', '#DCFCE7', '#BBF7D0']}
            locations={[0, 0.24, 0.46, 0.72, 1]}
            style={styles.bottomCardGradient}
          />

          {/* Subtle Tricolor Ribbon Bar */}
          <View style={styles.tricolorBar}>
            <View style={[styles.tricolorSegment, { backgroundColor: '#FF9933' }]} />
            <View style={[styles.tricolorSegment, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.tricolorSegment, { backgroundColor: '#138808' }]} />
          </View>

          {/* Clean Enlarged Sevazo Logo (Prominent, no extra box) */}
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.brandLogoImg}
            resizeMode="contain"
          />

          {/* Main Headline */}
          <Text style={styles.mainTitleBlue}>Seva Zo Dil Se Ki Jaye</Text>

          {/* Sub-headline */}
          <Text style={styles.subHeadline}>India's Trusted Service App</Text>

          {/* Interactive Dual Mode Switch (Sign Up vs Log In) */}
          <View style={styles.tabSwitchContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setActiveTab('signup');
                setError('');
              }}
              style={[
                styles.tabSwitchBtn,
                activeTab === 'signup' && styles.tabSwitchBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.tabSwitchText,
                  activeTab === 'signup' && styles.tabSwitchTextActive,
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setActiveTab('login');
                setError('');
              }}
              style={[
                styles.tabSwitchBtn,
                activeTab === 'login' && styles.tabSwitchBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.tabSwitchText,
                  activeTab === 'login' && styles.tabSwitchTextActive,
                ]}
              >
                Log In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs Container */}
          <View style={styles.formWrap}>
            {/* 1. Mobile Number Input (Visible only in 'signup' mode) */}
            {activeTab === 'signup' ? (
              <View style={styles.mobileInputRow}>
                {/* Flag Box */}
                <View style={styles.flagBox}>
                  <Text style={styles.flagText}>🇮🇳</Text>
                  <ChevronDown size={14} color="#64748B" style={{ marginLeft: 2 }} />
                </View>

                {/* Mobile Input Field */}
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
                color={emailFocused ? '#2563EB' : '#94A3B8'}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder={activeTab === 'signup' ? "Email address (Mandatory)" : "Enter your email address"}
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

            {/* 3. Action Submit Button */}
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
                {isLoading ? 'Sending OTP...' : activeTab === 'signup' ? 'Create Account' : 'Log In'}
              </Text>
            </TouchableOpacity>

            {/* 4. Terms & Privacy Policy at Absolute Bottom (Strict Sentence case with dot) */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText} numberOfLines={1}>
                By continuing, you agree to our terms & privacy policy.
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
    overflow: 'hidden',
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
  skipPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    ...Shadows.small,
  },
  skipText: {
    ...Typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  marqueeSection: {
    paddingTop: Spacing.xxl * 1.2,
    paddingBottom: Spacing.xs,
    overflow: 'hidden',
  },
  marqueeRowContainer: {
    height: 74,
    marginVertical: 3,
    justifyContent: 'center',
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridCardTile: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    marginHorizontal: GRID_ITEM_MARGIN,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    ...Shadows.small,
  },
  gridProductImg: {
    width: '100%',
    height: '100%',
  },
  bottomCard: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  bottomCardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
  tricolorBar: {
    flexDirection: 'row',
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xs + 2,
  },
  tricolorSegment: {
    flex: 1,
    height: '100%',
  },
  brandLogoImg: {
    width: 74,
    height: 74,
    marginBottom: 4,
  },
  mainTitleBlue: {
    ...Typography.titleLarge,
    fontSize: 22,
    fontWeight: '900',
    color: '#1D4ED8', // Vibrant Brand Blue
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 2,
    marginBottom: 2,
  },
  subHeadline: {
    ...Typography.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(241, 245, 249, 0.95)',
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
    color: '#1D4ED8',
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
    borderColor: '#1D4ED8',
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
    backgroundColor: '#FF7700', // Saffron CTA Button
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
    marginTop: Spacing.sm,
    marginBottom: 10,
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



