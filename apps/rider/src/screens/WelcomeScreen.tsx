import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bike, Clock, TrendingUp, ArrowRight } from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows, useAppColors } from '../theme';
import { Button } from '../components/Button';
import { useThemeStore } from '../store/themeStore';

export const WelcomeScreen = ({ navigation }: any) => {
  const colors = useAppColors();
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Hero Brand Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isDark ? colors.surface : '#FFF7ED',
              borderColor: colors.primary,
            },
          ]}
          accessible={true}
          accessibilityLabel="Sevazo Rider Logo"
        >
          <Bike size={44} color={colors.primary} strokeWidth={2.5} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to Sevazo Rider</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Hyperlocal fleet partner platform
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
            <Text style={[styles.valueTitle, { color: colors.textPrimary }]}>Grow with Sevazo.</Text>
            <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
              Peak surge multipliers & safety insurance protection.
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
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

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have a partner account?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="Login"
          >
            <Text style={[styles.footerLink, { color: colors.primary }]}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: Spacing.lg,
    ...Shadows.glowOrange,
  },
  title: {
    ...Typography.hero,
    fontSize: 26,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMedium,
    marginTop: Spacing.xs,
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
  },
  valueDesc: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  actions: {
    gap: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  footerText: {
    ...Typography.bodySmall,
  },
  footerLink: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
});

export default WelcomeScreen;
