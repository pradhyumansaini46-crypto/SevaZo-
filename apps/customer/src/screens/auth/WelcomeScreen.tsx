import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import { Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { continueAsGuest } = useAuthStore();

  const handleGuestMode = () => {
    continueAsGuest();
    navigation.replace('Main');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top + Spacing.lg : Spacing.xl * 1.5,
          paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.lg : Spacing.xl,
        },
      ]}
    >
      {/* Brand & Hero Graphics */}
      <View style={styles.heroSection}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>SEVAZO</Text>
        </View>

        <View style={styles.heroImageWrap}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.speedTag}>
            <Zap size={14} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.speedTagText}>10-15 Mins Superfast Delivery</Text>
          </View>
        </View>

        {/* Catchphrase Header */}
        <View style={styles.textWrap}>
          <Text style={styles.welcomeTitle}>Welcome to Sevazo</Text>
          <Text style={styles.welcomeSubtitle}>
            Everything you need, delivered fresh to your door in minutes.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresRow}>
          <View style={styles.featurePill}>
            <Sparkles size={14} color={Colors.primary} />
            <Text style={styles.featureText}>10,000+ Items</Text>
          </View>
          <View style={styles.featurePill}>
            <ShieldCheck size={14} color={Colors.success} />
            <Text style={styles.featureText}>100% Quality Guaranteed</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Button
          title="Login to Account"
          onPress={() => navigation.navigate('Login')}
          size="lg"
          style={styles.primaryBtn}
        />

        <Button
          title="Create New Account"
          variant="outline"
          onPress={() => navigation.navigate('Register')}
          size="lg"
          style={styles.secondaryBtn}
        />

        {/* Guest Exploration Link */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleGuestMode}
          style={styles.guestButton}
        >
          <Text style={styles.guestText}>Continue as Guest</Text>
          <ArrowRight size={16} color={Colors.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  logoText: {
    ...Typography.titleLarge,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 2,
  },
  heroImageWrap: {
    width: width - Spacing.xl * 2,
    height: 230,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.lg,
    ...Shadows.elevated,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  speedTag: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs + 3,
    paddingHorizontal: Spacing.md,
    ...Shadows.small,
  },
  speedTagText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  textWrap: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  welcomeTitle: {
    ...Typography.hero,
    fontSize: 26,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  featureText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  actionSection: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  guestText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
