import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Bike, Clock, TrendingUp, ArrowRight } from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows, useAppColors } from '../theme';
import { Button } from '../components/Button';
import { useThemeStore } from '../store/themeStore';

export const WelcomeScreen = ({ navigation }: any) => {
  const colors = useAppColors();
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Group: Brand Header + Feature Cards with Tight Gap */}
      <View style={styles.topGroup}>
        {/* Top Hero Brand Header with Official Graphic Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/sevazo-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Official SevaZo Logo"
          />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to SevaZo Rider</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Hyperlocal fleet partner platform
          </Text>
        </View>

        {/* Feature Value Props - Untouched (Tight Margin to Header) */}
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
              <Bike size={20} color={colors.primary} />
            </View>
            <View style={styles.valueTextContainer}>
              <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>Deliver orders.</Text>
              <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                Instant store pickup & short-distance drops.
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
              <Clock size={20} color={colors.accentGreen} />
            </View>
            <View style={styles.valueTextContainer}>
              <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>Earn on your schedule.</Text>
              <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                Flexible shifts with weekly & instant UPI payouts.
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
              <TrendingUp size={20} color={colors.secondary} />
            </View>
            <View style={styles.valueTextContainer}>
              <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>Grow with SevaZo.</Text>
              <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                Peak surge multipliers & safety insurance protection.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons: Stacked Register & Login (minHeight 48px) */}
      <View style={styles.actions}>
        <Button
          title="Register as Rider"
          variant="primary"
          size="large"
          onPress={() => navigation.navigate('Register')}
          rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
          accessibilityLabel="Register as Rider"
        />

        <Button
          title="Login"
          variant="outline"
          size="large"
          onPress={() => navigation.navigate('Login')}
          accessibilityLabel="Login to existing account"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 48,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  topGroup: {
    gap: 16,
  },
  header: {
    alignItems: 'center',
  },
  logoImage: {
    width: 110,
    height: 110,
    marginBottom: 2,
  },
  title: {
    ...Typography.hero,
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    ...Typography.bodyMedium,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  valueCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.lg,
    ...Shadows.card,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  valueIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  valueDesc: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'column',
    gap: Spacing.md,
    width: '100%',
  },
});

export default WelcomeScreen;
