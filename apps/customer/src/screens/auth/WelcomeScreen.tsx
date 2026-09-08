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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import {
  Mail,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { sendOtp, isLoading, continueAsGuest } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [error, setError] = useState('');

  // Animation values
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroTranslate = useRef(new Animated.Value(-20)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(heroTranslate, {
        toValue: 0,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(formFade, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(formTranslate, {
        toValue: 0,
        friction: 7,
        tension: 50,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulsing animation on the badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
      setError('Failed to send OTP. Please check your internet connection.');
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top > 0 ? insets.top + Spacing.sm : Spacing.md,
            paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.lg : Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Animated Hero Header */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: heroFade,
              transform: [{ translateY: heroTranslate }],
            },
          ]}
        >
          {/* Official Swan Logo */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Tagline & Animated Delivery Pill */}
          <Animated.View
            style={[
              styles.speedPill,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Zap size={14} color="#059669" fill="#059669" />
            <Text style={styles.speedPillText}>Instant 10-15 Min Delivery</Text>
          </Animated.View>

          <Text style={styles.heroTitle}>Groceries & Essentials in Minutes</Text>
          <Text style={styles.heroSubtitle}>
            Login or sign up with your mobile and email to access 10,000+ instant items.
          </Text>
        </Animated.View>

        {/* Animated Input Form Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: formFade,
              transform: [{ translateY: formTranslate }],
            },
          ]}
        >
          <Text style={styles.cardHeader}>Get Started</Text>
          <Text style={styles.cardSubHeader}>Enter your details to receive Email OTP</Text>

          {/* 1. Mobile Number Input (Mandatory) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Mobile Number <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                phoneFocused && styles.inputWrapperFocused,
                isPhoneValid && styles.inputWrapperValid,
              ]}
            >
              <View style={styles.prefixContainer}>
                <Text style={styles.flagIcon}>🇮🇳</Text>
                <Text style={styles.prefixText}>+91</Text>
                <View style={styles.prefixDivider} />
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="Enter 10-digit number"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={handlePhoneChange}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
              />

              {isPhoneValid ? (
                <CheckCircle2 size={18} color="#059669" style={styles.validCheck} />
              ) : null}
            </View>
          </View>

          {/* 2. Email Address Input (Mandatory) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Email Address <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused,
                isEmailValid && styles.inputWrapperValid,
              ]}
            >
              <Mail
                size={18}
                color={emailFocused ? Colors.primary : Colors.textMuted}
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={handleEmailChange}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />

              {isEmailValid ? (
                <CheckCircle2 size={18} color="#059669" style={styles.validCheck} />
              ) : null}
            </View>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.danger} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Animated Continue CTA Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isLoading || !isFormValid}
            style={[
              styles.continueButton,
              (!isFormValid || isLoading) && styles.continueButtonDisabled,
            ]}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? 'Sending OTP...' : 'Send Verification OTP'}
            </Text>
            <ArrowRight size={18} color={Colors.textInverse} style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* Trust Guarantees */}
          <View style={styles.trustBadgesRow}>
            <View style={styles.trustBadge}>
              <ShieldCheck size={14} color="#059669" />
              <Text style={styles.trustBadgeText}>100% Safe & Secure</Text>
            </View>
            <View style={styles.trustBadge}>
              <Sparkles size={14} color={Colors.primary} />
              <Text style={styles.trustBadgeText}>Instant Access</Text>
            </View>
          </View>
        </Animated.View>

        {/* Guest Exploration Option */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleGuestMode}
          style={styles.guestLink}
        >
          <Text style={styles.guestLinkText}>Explore Catalog as Guest</Text>
          <ArrowRight size={14} color={Colors.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.lg,
  },
  logoWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  speedPillText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    marginLeft: 6,
  },
  heroTitle: {
    ...Typography.titleLarge,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  card: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.elevated,
  },
  cardHeader: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardSubHeader: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  requiredStar: {
    color: Colors.danger,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    ...Shadows.small,
  },
  inputWrapperValid: {
    borderColor: '#10B981',
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  flagIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  prefixText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  prefixDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  fieldIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
    height: '100%',
  },
  validCheck: {
    marginLeft: Spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
    ...Shadows.medium,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 5,
  },
  guestLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  guestLinkText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});

