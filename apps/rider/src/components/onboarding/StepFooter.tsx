import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SaveContinueButton } from './SaveContinueButton';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

export interface StepFooterProps {
  onSaveContinue: () => void;
  onSaveExit?: () => void;
  continueTitle?: string;
  isLastStep?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  showSaveExit?: boolean;
}

export const StepFooter: React.FC<StepFooterProps> = ({
  onSaveContinue,
  onSaveExit,
  continueTitle,
  isLastStep = false,
  isLoading = false,
  disabled = false,
  showSaveExit = true,
}) => {
  return (
    <View style={styles.container}>
      <SaveContinueButton
        title={continueTitle}
        isLastStep={isLastStep}
        onPress={onSaveContinue}
        isLoading={isLoading}
        disabled={disabled}
      />

      {showSaveExit && onSaveExit && (
        <TouchableOpacity
          onPress={onSaveExit}
          style={styles.saveExitButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Save progress and exit"
        >
          <Text style={styles.saveExitText}>Save & Resume Later</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  saveExitButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  saveExitText: {
    ...Typography.bodyMedium,
    color: '#FF6600',
    fontWeight: '700',
  },
});

export default StepFooter;
