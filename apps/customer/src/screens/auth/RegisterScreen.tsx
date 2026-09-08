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

const ITEM_WIDTH = 90;
const ITEM_MARGIN = 6;
const SINGLE_ITEM_FULL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

const MarqueeRow: React.FC<{
  items: MarqueeProduct[];
  speed?: number;
  reverse?: boolean;
}> = ({ items, speed = 32000, reverse = false }) => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const rowWidth = items.length * SINGLE_ITEM_FULL_WIDTH;

  useEffect(() => {
    scrollAnim.setValue(reverse ? -rowWidth : 0);
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: reverse ? 0 : -rowWidth,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [items.length, reverse, speed]);

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
              { backgroundColor: item.bgColor || '#FFFFFF' },
            ]}
          >
            {item.badge ? (
              <View style={styles.productBadge}>
                <Text style={styles.productBadgeText}>{item.badge}</Text>
              </View>
            ) : null}
            <Text style={styles.productEmoji}>{item.emoji}</Text>
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { sendOtp, isLoading } = useAuthStore();

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
      <StatusBar barStyle="light-content" backgroundColor="#FF9933" />
      
      {/* Indian Tricolor Full Page Linear Gradient */}
      <LinearGradient
        colors={['#FF9933', '#FFA756', '#FFFFFF', '#FFFFFF', '#E6F4EA', '#138808']}
        locations={[0, 0.18, 0.42, 0.62, 0.85, 1]}
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
          onPress={() => navigation.replace('Main')}
          style={styles.skipLoginPill}
        >
          <Text style={styles.skipLoginText}>Skip login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.md : Spacing.lg,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Moving Products Marquee */}
        <View style={styles.marqueeSection}>
          <MarqueeRow items={MARQUEE_ROW_1} speed={28000} reverse={true} />
          <MarqueeRow items={MARQUEE_ROW_2} speed={32000} reverse={false} />
          <MarqueeRow items={MARQUEE_ROW_3} speed={26000} reverse={true} />
          <MarqueeRow items={MARQUEE_ROW_4} speed={30000} reverse={false} />
        </View>

        {/* Bottom Card Form */}
        <View style={styles.bottomCard}>
          <View style={styles.tricolorBar}>
            <View style={[styles.tricolorSegment, { backgroundColor: '#FF9933' }]} />
            <View style={[styles.tricolorSegment, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.tricolorSegment, { backgroundColor: '#138808' }]} />
          </View>

          <View style={styles.brandBoxWrap}>
            <View style={styles.brandSquare}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.brandLogoImg}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.mainTitle}>Seva Zo Dil Se Ki Jaye</Text>
          <Text style={styles.subTitle}>Create your account</Text>

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
                color={emailFocused ? '#FF7700' : '#94A3B8'}
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
                <CheckCircle2 size={16} color="#138808" style={styles.validIcon} />
              ) : null}
            </View>

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

            <View style={styles.termsContainer}>
              <Text style={styles.termsText} numberOfLines={1}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms</Text> &{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
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
    paddingTop: Spacing.xxl * 1.5,
    paddingBottom: Spacing.xs,
    overflow: 'hidden',
  },
  marqueeRowContainer: {
    height: 94,
    marginVertical: 3,
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCard: {
    width: ITEM_WIDTH,
    height: 86,
    marginHorizontal: ITEM_MARGIN,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...Shadows.small,
  },
  productBadge: {
    position: 'absolute',
    top: 5,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  productBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#334155',
  },
  productEmoji: {
    fontSize: 34,
    marginTop: 2,
    marginBottom: 2,
  },
  productName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    width: '100%',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.elevated,
  },
  tricolorBar: {
    flexDirection: 'row',
    width: 64,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  tricolorSegment: {
    flex: 1,
    height: '100%',
  },
  brandBoxWrap: {
    marginBottom: Spacing.xs,
  },
  brandSquare: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    ...Shadows.small,
  },
  brandLogoImg: {
    width: 48,
    height: 48,
  },
  mainTitle: {
    ...Typography.titleLarge,
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 2,
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
    height: 52,
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
    height: 52,
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
    height: 52,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
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
    backgroundColor: '#FF7700', // Saffron CTA
    borderRadius: 16,
    paddingVertical: 15,
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

