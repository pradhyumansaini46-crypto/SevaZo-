import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SaveContinueButton } from './SaveContinueButton';
import { Colors, Spacing } from '../../theme';

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
  continueTitle,
  isLastStep = false,
  isLoading = false,
  disabled = false,
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
  },
});

export default StepFooter;
