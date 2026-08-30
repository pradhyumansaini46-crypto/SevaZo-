import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import {
  User,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

export const ResumeRegistrationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { registrationDraft, customer, setRegistrationStep } = useAuthStore();

  const getStepDetails = () => {
    const step = registrationDraft.currentStep || 'RegisterProfile';
    switch (step) {
      case 'RegisterProfile':
        return {
          progress: 25,
          nextScreen: 'RegisterProfile',
          stepTitle: 'Basic Profile & Details',
          stepDesc: 'Name, email, and optional avatar for your account.',
        };
      case 'RegisterLocation':
        return {
          progress: 50,
          nextScreen: 'RegisterLocation',
          stepTitle: 'Delivery Location',
          stepDesc: 'Pin your area to connect with nearby 10-min dark stores.',
        };
      case 'RegisterAddress':
        return {
          progress: 70,
          nextScreen: 'RegisterAddress',
          stepTitle: 'Doorstep Address Form',
          stepDesc: 'House number, street, and delivery instructions.',
        };
      case 'RegisterPreferences':
        return {
          progress: 85,
          nextScreen: 'RegisterPreferences',
          stepTitle: 'Shopping Preferences',
          stepDesc: 'Favorite categories and notification controls.',
        };
      case 'RegisterTerms':
      default:
        return {
          progress: 95,
          nextScreen: 'RegisterTerms',
          stepTitle: 'Terms & Final Activation',
          stepDesc: 'Confirm legal consent and launch your account.',
        };
    }
  };

  const details = getStepDetails();
  const displayName = registrationDraft.firstName || customer?.name?.split(' ')[0] || 'there';

  const handleContinue = () => {
    navigation.replace(details.nextScreen);
  };

  const handleStartOver = () => {
    setRegistrationStep('RegisterProfile');
    navigation.replace('Register');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top + Spacing.lg : Spacing.xl,
          paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.lg : Spacing.xl,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Brand Header */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>SevaZo</Text>
          </View>
          <View style={styles.draftBadge}>
            <Clock size={12} color={Colors.accentOrange} />
            <Text style={styles.draftBadgeText}>Setup in Progress</Text>
          </View>
        </View>

        {/* Hero Welcome Back Card */}
        <View style={styles.headerBlock}>
          <Text style={styles.welcomeTitle}>Welcome back, {displayName}!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your account setup is almost complete. Pick up right where you left off.
          </Text>
        </View>

        {/* Progress Bar Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressLabel}>Onboarding Progress</Text>
            <Text style={styles.progressPercent}>{details.progress}% Complete</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${details.progress}%` }]} />
          </View>

          <Text style={styles.progressHint}>
            Only a few quick details remaining to unlock 10-15 minute grocery deliveries.
          </Text>
        </View>

        {/* Next Step Preview */}
        <View style={styles.stepPreviewCard}>
          <View style={styles.stepIconCircle}>
            <Zap size={22} color={Colors.primary} />
          </View>

          <View style={styles.stepTextWrap}>
            <Text style={styles.stepBadge}>NEXT UP</Text>
            <Text style={styles.stepTitle}>{details.stepTitle}</Text>
            <Text style={styles.stepDesc}>{details.stepDesc}</Text>
          </View>
        </View>

        {/* Completed Checklist */}
        <View style={styles.checklistCard}>
          <Text style={styles.checklistHeader}>Your Progress</Text>

          <View style={styles.checkItem}>
            <CheckCircle2 size={18} color={Colors.success} />
            <Text style={styles.checkItemTextDone}>
              Mobile Number Verified ({registrationDraft.phone || '+91 9876543210'})
            </Text>
          </View>

          <View style={styles.checkItem}>
            {details.progress >= 50 ? (
              <CheckCircle2 size={18} color={Colors.success} />
            ) : (
              <View style={styles.pendingDot} />
            )}
            <Text
              style={
                details.progress >= 50
                  ? styles.checkItemTextDone
                  : styles.checkItemTextPending
              }
            >
              Profile & Personal Information
            </Text>
          </View>

          <View style={styles.checkItem}>
            {details.progress >= 75 ? (
              <CheckCircle2 size={18} color={Colors.success} />
            ) : (
              <View style={styles.pendingDot} />
            )}
            <Text
              style={
                details.progress >= 75
                  ? styles.checkItemTextDone
                  : styles.checkItemTextPending
              }
            >
              Delivery Address & Pinning
            </Text>
          </View>

          <View style={styles.checkItem}>
            {details.progress >= 95 ? (
              <CheckCircle2 size={18} color={Colors.success} />
            ) : (
              <View style={styles.pendingDot} />
            )}
            <Text
              style={
                details.progress >= 95
                  ? styles.checkItemTextDone
                  : styles.checkItemTextPending
              }
            >
              Preferences & Legal Consent
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionBlock}>
          <Button
            title="Continue Setup"
            onPress={handleContinue}
            size="lg"
            icon={<ArrowRight size={18} color={Colors.textInverse} />}
            iconPosition="right"
            style={styles.continueBtn}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleStartOver}
            style={styles.startOverBtn}
          >
            <RotateCcw size={16} color={Colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={styles.startOverText}>Start Over with Another Number</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  logoText: {
    ...Typography.titleSmall,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  draftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  draftBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 4,
  },
  headerBlock: {
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    ...Typography.hero,
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  progressCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressPercent: {
    ...Typography.bodyMedium,
    fontWeight: '900',
    color: Colors.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  progressHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  stepPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: Spacing.lg,
  },
  stepIconCircle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    ...Shadows.small,
  },
  stepTextWrap: {
    flex: 1,
  },
  stepBadge: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primaryDark,
    letterSpacing: 1,
    marginBottom: 2,
  },
  stepTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  stepDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  checklistCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  checklistHeader: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkItemTextDone: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  checkItemTextPending: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  pendingDot: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  actionBlock: {
    gap: Spacing.md,
  },
  continueBtn: {
    width: '100%',
  },
  startOverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  startOverText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
