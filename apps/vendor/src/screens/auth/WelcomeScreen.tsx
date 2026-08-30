import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Store, ArrowRight, ShieldCheck, TrendingUp, Zap, Sparkles } from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../../components/Button';

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Top Hero Visual */}
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Store size={40} color="#FFFFFF" />
            <View style={styles.sparkleBadge}>
              <Sparkles size={14} color="#0F172A" />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>SevaZo Vendor</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Grow your business with SevaZo
          </Text>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.featuresSection}>
          <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
              <TrendingUp size={20} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Hyperlocal Reach</Text>
              <Text style={[styles.featureSub, { color: colors.textSecondary }]}>
                Connect directly with thousands of daily customers in your area.
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: '#FEF3C7' }]}>
              <Zap size={20} color="#D97706" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Instant Settlement</Text>
              <Text style={[styles.featureSub, { color: colors.textSecondary }]}>
                Daily automated payouts directly to your verified bank account.
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: '#EDE9FE' }]}>
              <ShieldCheck size={20} color="#7C3AED" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Verified Partner Network</Text>
              <Text style={[styles.featureSub, { color: colors.textSecondary }]}>
                Dedicated dispatch fleet and priority merchant partner support.
              </Text>
            </View>
          </View>
        </View>

        {/* Action CTAs */}
        <View style={styles.actionSection}>
          <Button
            title="Register Your Business"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Register')}
            rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
            style={styles.registerButton}
          />

          <Button
            title="Login"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
          />

          <Text style={[styles.footerNotice, { color: colors.textSecondary }]}>
            By continuing, you agree to SevaZo's Terms of Merchant Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
    ...Shadows.elevated,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  featuresSection: {
    gap: 12,
    marginVertical: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionSection: {
    gap: 10,
    alignItems: 'center',
  },
  registerButton: {
    marginBottom: 2,
  },
  loginButton: {
    borderWidth: 1.5,
  },
  footerNotice: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    paddingHorizontal: 12,
  },
});
