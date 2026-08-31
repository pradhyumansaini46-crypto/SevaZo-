import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Bike, Clock, TrendingUp, ArrowRight, Sparkles } from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows, useAppColors } from '../theme';
import { Button } from '../components/Button';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

export const WelcomeScreen = ({ navigation }: any) => {
  const colors = useAppColors();
  const isDark = useThemeStore((state) => state.isDark);
  const { setAuth } = useAuthStore();

  const handleGuestLogin = () => {
    // Initialize mock authenticated rider for instant dashboard testing
    setAuth(
      'guest-jwt-token-preview',
      {
        id: 'rdr-guest-preview',
        applicationId: 'SVZ-RID-000123',
        name: 'Rahul Sharma (Guest)',
        phone: '+91 9876543210',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        isOnline: true,
        rating: 4.95,
        totalEarnings: 14850,
        walletBalance: 2450,
        deliveriesCount: 142,
      },
      'APPROVED'
    );
    navigation.replace('Main');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentWrapper}>
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

        {/* Feature Value Props Card (Tight Compact Layout) */}
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

        {/* Action Buttons Container (Connected Directly to Top Content Without Gap) */}
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

          {/* Guest Login Direct Access (Test Mode) */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={handleGuestLogin}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Guest Login Test Access"
          >
            <Sparkles size={16} color="#EA580C" />
            <Text style={styles.guestBtnText}>Guest Login (Direct Dashboard Access)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 24,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 16,
  },
  header: {
    alignItems: 'center',
  },
  logoImage: {
    width: 95,
    height: 95,
    marginBottom: 2,
  },
  title: {
    ...Typography.hero,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginTop: 2,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
});

export default WelcomeScreen;
