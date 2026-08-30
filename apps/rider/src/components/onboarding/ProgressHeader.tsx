import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Spacing, BorderRadius, useAppColors } from '../../theme';
import { useThemeStore } from '../../store/themeStore';

export interface ProgressHeaderProps {
  currentStep: number;
  totalSteps?: number;
  stepTitle: string;
  completionPercentage?: number;
  onBack?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  showBack?: boolean;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentStep,
  totalSteps = 14,
  stepTitle,
  completionPercentage = 0,
  onBack,
  onCancel,
  onClose,
  showBack = true,
}) => {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const isDark = useThemeStore((state) => state.isDark);
  const handleExit = onCancel || onClose;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 16) + 4,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Top Navigation Row: Back | Centered Title | Cancel */}
      <View style={styles.topRow}>
        {showBack && onBack ? (
          <TouchableOpacity
            style={[
              styles.navButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#F1F5F9',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : '#E2E8F0',
              },
            ]}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous onboarding step"
          >
            <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.headerTitleContainer}>
          <Text
            style={[styles.headerTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {stepTitle}
          </Text>
        </View>

        {handleExit ? (
          <TouchableOpacity
            style={[
              styles.navButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#F1F5F9',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : '#E2E8F0',
              },
            ]}
            onPress={handleExit}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel onboarding and exit"
          >
            <X size={20} color={colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Modern Progress Line */}
      <View
        style={[
          styles.track,
          { backgroundColor: isDark ? colors.surfaceElevated : '#F1F5F9' },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, Math.max(0, completionPercentage))}%`,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 38,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  track: {
    height: 5,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: 4,
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});

export default ProgressHeader;
