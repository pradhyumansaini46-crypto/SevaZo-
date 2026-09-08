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

const ITEM_WIDTH = 76;
const ITEM_MARGIN = 10;
const SINGLE_ITEM_FULL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

const MarqueeRow: React.FC<{
  items: MarqueeProduct[];
  speed?: number;
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

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { sendOtp, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [error, setError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isFormValid = isEmailValid;

  const handleEmailChange = (text: string) => {
    setError('');
    setEmail(text);
  };

  const handleContinue = async () => {
    if (!isEmailValid) {
      setError('Please enter a valid registered email address');
      return;
    }

    setError('');
    const sent = await sendOtp('', email.trim().toLowerCase());
    if (sent) {
      navigation.navigate('Otp', {
        phone: email.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        mode: 'LOGIN',
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
          {/* Greenish Gradient starting right below "Seva Zo Dil Se Ki Jaye" title */}
          <LinearGradient
            colors={['#FFFFFF', '#FFFFFF', '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC']}
            locations={[0, 0.22, 0.42, 0.65, 0.85, 1]}
            style={styles.bottomCardGradient}
          />

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
          <Text style={styles.subTitle}>Log in to your account</Text>

          <View style={styles.formWrap}>
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
                {isLoading ? 'Sending OTP...' : 'Log In'}
              </Text>
            </TouchableOpacity>

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
    paddingBottom: Spacing.md,
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
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
});
