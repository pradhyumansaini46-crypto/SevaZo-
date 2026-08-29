import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { ArrowLeft, Bookmark } from 'lucide-react-native';

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  onBack?: () => void;
  onSaveExit?: () => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentStep,
  totalSteps = 6,
  stepTitle,
  onBack,
  onSaveExit,
}) => {
  const insets = useSafeAreaInsets();
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top + Spacing.xs : Spacing.sm,
        },
      ]}
    >
      {/* Top Bar Navigation */}
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.iconBtn}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}

        <View style={styles.badgeWrap}>
          <Text style={styles.stepBadgeText}>
            Step {currentStep} of {totalSteps}: {stepTitle}
          </Text>
        </View>

        {onSaveExit ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onSaveExit}
            style={styles.saveExitBtn}
          >
            <Bookmark size={14} color={Colors.primaryDark} style={{ marginRight: 4 }} />
            <Text style={styles.saveExitText}>Save & Exit</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Visual Animated Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrap: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  stepBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  saveExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveExitText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
});
