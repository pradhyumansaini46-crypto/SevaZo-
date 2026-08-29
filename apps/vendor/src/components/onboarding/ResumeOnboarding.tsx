import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlayCircle, ShieldCheck } from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../Button';

interface ResumeOnboardingProps {
  currentStep: number;
  totalSteps?: number;
  progressPercentage: number;
  businessName?: string;
  onResume: () => void;
}

export const ResumeOnboarding: React.FC<ResumeOnboardingProps> = ({
  currentStep,
  totalSteps = 13,
  progressPercentage,
  businessName,
  onResume,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
          <ShieldCheck size={24} color={colors.primary} />
        </View>
        <View style={styles.titleText}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Incomplete Application Found
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {businessName || 'Your business application'} is currently {Math.round(progressPercentage)}% completed.
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, Math.max(5, progressPercentage))}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.stepText, { color: colors.primary }]}>
          Step {currentStep}/{totalSteps}
        </Text>
      </View>

      <Button
        title="Resume Application"
        variant="primary"
        size="md"
        fullWidth
        onPress={onResume}
        rightIcon={<PlayCircle size={16} color="#FFFFFF" />}
        style={styles.resumeBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginVertical: 12,
    ...Shadows.elevated,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resumeBtn: {
    marginTop: 4,
  },
});
