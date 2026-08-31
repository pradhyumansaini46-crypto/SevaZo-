import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Store, Clock, TrendingUp, ArrowRight } from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows, getThemeColors } from '../../theme';
import { Button } from '../../components/Button';
import { useThemeStore } from '../../stores/themeStore';

export const WelcomeScreen = ({ navigation }: any) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Top Group: Brand Header + Feature Cards with Tight Gap */}
        <View style={styles.topGroup}>
          {/* Top Hero Brand Header with Official Graphic Logo */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/sevazo-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="Official SevaZo Logo"
            />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to SevaZo Vendor</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Hyperlocal merchant partner platform
            </Text>
          </View>

          {/* Feature Value Props */}
          <View
            style={[
              styles.valueCard,
              {
                backgroundColor: isDark ? colors.surface : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.valueRow}>
              <View
                style={[
                  styles.valueIconCircle,
                  { backgroundColor: isDark ? 'rgba(255, 102, 0, 0.15)' : '#FFF7ED' },
                ]}
              >
                <Store size={20} color="#FF6600" />
              </View>
              <View style={styles.valueTextContainer}>
                <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>Reach local customers.</Text>
                <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                  Instant store discovery & high-volume orders in your area.
                </Text>
              </View>
            </View>

            <View style={styles.valueRow}>
              <View
                style={[
                  styles.valueIconCircle,
                  { backgroundColor: isDark ? '#052E16' : '#ECFDF5' },
                ]}
              >
                <Clock size={20} color="#10B981" />
              </View>
              <View style={styles.valueTextContainer}>
                <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>Daily automated payouts.</Text>
                <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                  Next-day direct bank transfers & automated settlements.
                </Text>
              </View>
            </View>

            <View style={styles.valueRow}>
              <View
                style={[
                  styles.valueIconCircle,
                  { backgroundColor: isDark ? '#2A1B0A' : '#FEF3C7' },
                ]}
              >
                <TrendingUp size={20} color="#D97706" />
              </View>
              <View style={styles.valueTextContainer}>
                <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>Grow with SevaZo.</Text>
                <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                  Dedicated fleet dispatch & real-time analytics portal.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons: Stacked Register & Login */}
        <View style={styles.actions}>
          <Button
            title="Register Your Business"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Register')}
            rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
            accessibilityLabel="Register Your Business"
          />

          <Button
            title="Login"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Login')}
            accessibilityLabel="Login to existing vendor account"
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
    paddingHorizontal: Spacing.xl,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topGroup: {
    gap: 14,
  },
  header: {
    alignItems: 'center',
  },
  logoImage: {
    width: 105,
    height: 105,
    marginBottom: 2,
  },
  title: {
    ...Typography.hero,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
  },
  subtitle: {
    ...Typography.bodyMedium,
    marginTop: 2,
    textAlign: 'center',
    fontSize: 13,
  },
  valueCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.md,
    ...Shadows.card,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  valueIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    fontSize: 14,
  },
  valueDesc: {
    ...Typography.bodySmall,
    marginTop: 2,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    marginTop: 10,
  },
  footerNotice: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    paddingHorizontal: 12,
  },
});

export default WelcomeScreen;
