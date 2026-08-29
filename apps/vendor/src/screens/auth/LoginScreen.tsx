import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { ArrowLeft, Phone, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { phoneSchema } from '../../validation/schemas';
import { VendorApi } from '../../services/vendorApi';
import { normalizeApiError } from '../../utils';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhone(cleaned);
      if (error) setError(undefined);
    }
  };

  const handleContinue = async () => {
    const validation = phoneSchema.safeParse(phone);
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const res = await VendorApi.sendOtp(phone);
      navigation.navigate('OtpVerification', {
        phone,
        isRegister: false,
        message: res.message,
      });
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      if (normalized.code === 'RATE_LIMIT_EXCEEDED' || normalized.statusCode === 429) {
        setError('Too many OTP requests. Please wait a few minutes before trying again.');
      } else {
        setError(normalized.message || 'Unable to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Form Hero */}
          <View style={styles.heroSection}>
            <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
              <Phone size={28} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Vendor Login</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your registered 10-digit mobile number to access your merchant portal.
            </Text>
          </View>

          {/* Input Field */}
          <View style={styles.formSection}>
            <Input
              label="Registered Mobile Number"
              placeholder="98765 43210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={handlePhoneChange}
              prefix="+91"
              error={error}
              maxLength={10}
              leftIcon={<Phone size={18} color={colors.textSecondary} />}
              helperText="We will send a 6-digit OTP to verify your identity."
            />

            <Button
              title="Continue"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={phone.length !== 10 || loading}
              onPress={handleContinue}
              rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
              style={styles.continueBtn}
            />

            {/* Quick Demo OTP Hint */}
            <View style={[styles.hintCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ShieldCheck size={16} color={colors.primary} />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                Demo verification code: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>123456</Text>
              </Text>
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have a vendor account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>Register Business</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Shadows.card,
  },
  heroSection: {
    marginBottom: 28,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  formSection: {
    gap: 16,
  },
  continueBtn: {
    marginTop: 8,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
