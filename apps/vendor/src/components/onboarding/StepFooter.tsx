import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { SaveContinueButton } from './SaveContinueButton';

interface StepFooterProps {
  currentStep: number;
  totalSteps?: number;
  loading?: boolean;
  disabled?: boolean;
  onBack?: () => void;
  onContinue: () => void;
  continueTitle?: string;
}

export const StepFooter: React.FC<StepFooterProps> = ({
  currentStep,
  totalSteps = 13,
  loading = false,
  disabled = false,
  onBack,
  onContinue,
  continueTitle,
}) => {
  const insets = useSafeAreaInsets();
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isLastStep = currentStep === totalSteps;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.content}>
        {onBack && currentStep > 1 && (
          <TouchableOpacity
            onPress={onBack}
            disabled={loading}
            style={[styles.backBtn, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Back to previous step"
          >
            <ArrowLeft size={18} color={colors.textPrimary} />
            <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionWrap}>
          <SaveContinueButton
            title={continueTitle}
            isLastStep={isLastStep}
            loading={loading}
            disabled={disabled}
            onPress={onContinue}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    ...Shadows.elevated,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionWrap: {
    flex: 1,
  },
});
