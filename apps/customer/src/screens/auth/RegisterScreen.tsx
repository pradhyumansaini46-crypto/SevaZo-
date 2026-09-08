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
import { Mail, CheckCircle2, AlertCircle, ChevronDown, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import {
  MARQUEE_ROW_1,
  MARQUEE_ROW_2,
  MARQUEE_ROW_3,
  MARQUEE_ROW_4,
  MarqueeProduct,
} from './marqueeProducts';

const { width } = Dimensions.get('window');
const GRID_GAP = 6;
// Exactly 5 columns visible across mobile screen width
const GRID_ITEM_SIZE = Math.floor((width - 16 - (GRID_GAP * 4)) / 5);
const SINGLE_ITEM_FULL_WIDTH = GRID_ITEM_SIZE + GRID_GAP;

// Smooth Non-Stopping Infinite Continuous Moving Grid Row Component
const MarqueeRow: React.FC<{
  items: MarqueeProduct[];
  speed?: number;
  reverse?: boolean;
}> = ({ items, speed = 36000, reverse = false }) => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const singleCycleWidth = items.length * SINGLE_ITEM_FULL_WIDTH;

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    let isMounted = true;

    const runNonStop = () => {
      if (!isMounted) return;
      scrollAnim.setValue(reverse ? -singleCycleWidth : 0);
      anim = Animated.timing(scrollAnim, {
        toValue: reverse ? 0 : -singleCycleWidth,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
        isInteraction: false,
      });

      anim.start(({ finished }) => {
        if (finished && isMounted) {
          runNonStop();
        }
      });
    };

    runNonStop();

    return () => {
      isMounted = false;
      anim?.stop();
    };
  }, [items.length, reverse, speed, singleCycleWidth]);

  // Quadruple buffer to guarantee completely gapless, non-stop continuous loop
  const displayItems = [...items, ...items, ...items, ...items];

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

export const RegisterScreen: React.FC = () => {
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

  const handleContinue = async () => {
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
    const sent = await sendOtp(formattedPhone, email.trim().toLowerCase());
    if (sent) {
      navigation.navigate('Otp', {
        phone: formattedPhone,
        email: email.trim().toLowerCase(),
        mode: 'REGISTER',
      });
    } else {
      setError('Failed to send verification code. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4EC" />
      
      {/* Indian Tricolor Full Page Linear Gradient */}
      <LinearGradient
        colors={['#FFF4EC', '#FFE8D6', '#FFFDF9', '#FFFFFF', '#F0FDF4', '#DCFCE7']}
        locations={[0, 0.22, 0.45, 0.65, 0.85, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Navigation */}
      <View
        style={[
          styles.topNav,
          { paddingTop: insets.top > 0 ? insets.top + Spacing.xs : Spacing.md },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            continueAsGuest();
            navigation.replace('Main');
          }}
          style={styles.skipLoginPill}
        >
          <Text style={styles.skipLoginText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.sm : Spacing.md,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Moving 4-Row Products Marquee Grid */}
        <View style={styles.marqueeSection}>
          <MarqueeRow items={MARQUEE_ROW_1} speed={38000} reverse={true} />
          <MarqueeRow items={MARQUEE_ROW_2} speed={42000} reverse={false} />
          <MarqueeRow items={MARQUEE_ROW_3} speed={36000} reverse={true} />
          <MarqueeRow items={MARQUEE_ROW_4} speed={40000} reverse={false} />
        </View>

        {/* Bottom Card Form */}
        <View style={styles.bottomCard}>
          {/* Greenish Gradient starting right below "Seva Zo Dil Se Ki Jaye" title */}
          <LinearGradient
            colors={['#FFFFFF', '#FFFFFF', '#F0FDF4', '#DCFCE7', '#BBF7D0']}
            locations={[0, 0.22, 0.42, 0.65, 1]}
            style={styles.bottomCardGradient}
          />

          <View style={styles.tricolorBar}>
            <View style={[styles.tricolorSegment, { backgroundColor: '#FF9933' }]} />
            <View style={[styles.tricolorSegment, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.tricolorSegment, { backgroundColor: '#138808' }]} />
          </View>

          {/* Clean Enlarged Sevazo Logo */}
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.brandLogoImg}
            resizeMode="contain"
          />

          <Text style={styles.mainTitleBlue}>Seva Zo Dil Se Ki Jaye</Text>
          <Text style={styles.subHeadline}>India's Trusted Service App</Text>

          <View style={styles.formWrap}>
            {/* Mobile Number Row */}
            <View style={styles.mobileInputRow}>
              <View style={styles.flagBox}>
                <Text style={styles.flagText}>🇮🇳</Text>
                <ChevronDown size={14} color="#64748B" style={{ marginLeft: 2 }} />
              </View>

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

            {/* Email Address Row */}
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
                placeholder="Email address (Mandatory)"
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

            {/* Continue CTA */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleContinue}
              disabled={isLoading || !isFormValid}
              style={[
                styles.continueBtn,
                (!isFormValid || isLoading) && styles.continueBtnDisabled,
              ]}
            >
              <Text style={styles.continueBtnText}>
                {isLoading ? 'Sending OTP...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Switch to Login */}
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLinkText}>Log In</Text>
              </TouchableOpacity>
            </View>

            {/* Terms & Privacy Policy at Absolute Bottom */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText} numberOfLines={1}>
                By Continuing, You Agree to Our Terms & Privacy Policy.
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
    backgroundColor: '#FFF4EC',
    overflow: 'hidden',
  },
  topNav: {
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
    padding: Spacing.xs + 2,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipLoginPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    ...Shadows.small,
  },
  skipLoginText: {
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
    paddingTop: Spacing.xxl * 1.05,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  marqueeRowContainer: {
    height: GRID_ITEM_SIZE,
    marginBottom: GRID_GAP,
    justifyContent: 'center',
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridCardTile: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    marginRight: GRID_GAP,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
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
    color: '#1D4ED8',
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
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  loginPromptText: {
    ...Typography.caption,
    color: '#64748B',
    fontSize: 13,
  },
  loginLinkText: {
    ...Typography.caption,
    color: '#1D4ED8',
    fontWeight: '800',
    fontSize: 13,
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
