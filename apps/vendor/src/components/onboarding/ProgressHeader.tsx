import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { getThemeColors, BorderRadius } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps?: number;
  stepTitle: string;
  categoryTitle?: string;
  progressPercentage: number;
  onBack?: () => void;
  onSaveAndExit?: () => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentStep,
  totalSteps = 13,
  stepTitle,
  categoryTitle = 'VENDOR ONBOARDING',
  progressPercentage,
  onBack,
  onSaveAndExit,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {/* Top Bar Actions */}
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous step"
          >
            <ArrowLeft size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}

        <View style={styles.titleCenter}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>{categoryTitle}</Text>
          <Text style={[styles.stepIndicator, { color: colors.textSecondary }]}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        {onSaveAndExit ? (
          <TouchableOpacity
            onPress={onSaveAndExit}
            style={[styles.saveExitBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Save and exit application"
          >
            <Bookmark size={14} color={colors.primary} />
            <Text style={[styles.saveExitText, { color: colors.textPrimary }]}>Save & Exit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}
      </View>

      {/* Progress Bar & Percentage */}
      <View style={styles.progressBarWrapper}>
        <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, Math.max(5, progressPercentage))}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.percentageText, { color: colors.textSecondary }]}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionPlaceholder: {
    width: 36,
  },
  titleCenter: {
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  saveExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  saveExitText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'right',
  },
});
