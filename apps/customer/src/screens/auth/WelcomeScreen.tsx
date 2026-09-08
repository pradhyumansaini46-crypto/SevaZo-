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
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Mail, CheckCircle2, AlertCircle, ChevronDown, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import {
  MARQUEE_ROW_1,
  MARQUEE_ROW_2,
  MARQUEE_ROW_3,
  MARQUEE_ROW_4,
  MarqueeProduct,
} from './marqueeProducts';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 84;
const ITEM_MARGIN = 6;
const SINGLE_ITEM_FULL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2; // 96px

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
  }, [items.length, reverse, speed]);

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
            style={[
              styles.productCard,
              { backgroundColor: item.bgColor || '#F0F9FF' },
            ]}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
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

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [error, setError] = useState('');

  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length === 10;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isFormValid = isPhoneValid && isEmailValid;

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
    if (!isPhoneValid) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    const formattedPhone = `+91 ${cleanPhone}`;
    const success = await sendOtp(formattedPhone, email.trim().toLowerCase());

    if (success) {
      navigation.navigate('Otp', {
        phone: formattedPhone,
        email: email.trim().toLowerCase(),
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFF7ED" />

      {/* Background Gradient Ambient Layer (Light Orange with Greenish Touches) */}
      <View style={styles.ambientTopGlow} />
      <View style={styles.ambientGreenTouch} />

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
        {/* Continuous Moving Product Marquee (4 Staggered Rows, 100+ Modern Items) */}
        <View style={styles.marqueeSection}>
          <MarqueeRow items={MARQUEE_ROW_1} speed={30000} reverse={true} />
          <MarqueeRow items={MARQUEE_ROW_2} speed={34000} reverse={false} />
          <MarqueeRow items={MARQUEE_ROW_3} speed={28000} reverse={true} />
          <MarqueeRow items={MARQUEE_ROW_4} speed={32000} reverse={false} />
        </View>

        {/* Bottom Card / Auth Sheet */}
        <View style={styles.bottomCard}>
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

          {/* Tagline & Subheading */}
          <Text style={styles.mainTitle}>India's instant commerce app</Text>
          <Text style={styles.subTitle}>Log in or sign up</Text>

          {/* Form Container */}
          <View style={styles.formWrap}>
            {/* 1. Mobile Number Input with Flag Box */}
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
                  placeholder="Enter mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                />
                {isPhoneValid ? (
                  <CheckCircle2 size={16} color="#059669" style={styles.validIcon} />
                ) : null}
              </View>
            </View>

            {/* 2. Email Address Input (Below Mobile Number) */}
            <View
              style={[
                styles.emailInputBox,
                emailFocused && styles.inputFocused,
                isEmailValid && styles.inputValid,
              ]}
            >
              <Mail
                size={18}
                color={emailFocused ? Colors.primary : '#94A3B8'}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter email address"
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
                <CheckCircle2 size={16} color="#059669" style={styles.validIcon} />
              ) : null}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorRow}>
                <AlertCircle size={14} color={Colors.danger} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* 3. Continue Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={isLoading || !isFormValid}
              style={[
                styles.continueBtn,
                (!isFormValid || isLoading) && styles.continueBtnDisabled,
              ]}
            >
              <Text style={styles.continueBtnText}>
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            {/* Terms and Privacy Policy */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our:{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
                <Text style={styles.termsLink}>Privacy policy</Text>
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
    backgroundColor: '#FFF7ED', // Light Orange Background Theme
  },
  ambientTopGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    backgroundColor: '#FFEDD5', // Soft Warm Light Orange
    opacity: 0.6,
  },
  ambientGreenTouch: {
    position: 'absolute',
    top: 60,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#D1FAE5', // Fresh Greenish Accent Touch
    opacity: 0.45,
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
    backdropFilter: 'blur(8px)',
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
    paddingTop: Spacing.xxl * 1.5,
    paddingBottom: Spacing.sm,
    overflow: 'hidden',
  },
  marqueeRowContainer: {
    height: 98,
    marginVertical: 4,
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCard: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    marginHorizontal: ITEM_MARGIN,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...Shadows.small,
  },
  productImage: {
    width: 66,
    height: 66,
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#FED7AA',
    ...Shadows.elevated,
  },
  brandBoxWrap: {
    marginBottom: Spacing.xs,
  },
  brandSquare: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#FDE047', // Iconic Golden Warm Brand Box
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadows.small,
  },
  brandLogoImg: {
    width: 52,
    height: 52,
  },
  mainTitle: {
    ...Typography.titleLarge,
    fontSize: 23,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  subTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  formWrap: {
    width: '100%',
  },
  mobileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.sm + 2,
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 54,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
    ...Shadows.small,
  },
  flagText: {
    fontSize: 20,
  },
  numberInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 54,
    paddingHorizontal: Spacing.md,
    ...Shadows.small,
  },
  countryCode: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
  },
  emailInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 54,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  inputLeftIcon: {
    marginRight: Spacing.sm,
  },
  inputFocused: {
    borderColor: '#059669', // Emerald Green Accent on Focus
    backgroundColor: '#FFFFFF',
  },
  inputValid: {
    borderColor: '#10B981',
  },
  textInput: {
    flex: 1,
    ...Typography.bodyLarge,
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
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  continueBtn: {
    backgroundColor: '#059669', // Clean Emerald Green CTA
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...Shadows.card,
  },
  continueBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 16,
  },
  termsContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  termsText: {
    ...Typography.caption,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  termsLink: {
    color: '#0F172A',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});


