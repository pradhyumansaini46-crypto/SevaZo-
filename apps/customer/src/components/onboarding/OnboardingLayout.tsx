import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme';
import { ProgressHeader } from './ProgressHeader';
import { StepContainer } from './StepContainer';
import { StepFooter } from './StepFooter';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps?: number;
  stepTitle: string;
  pageTitle: string;
  pageSubtitle?: string;
  onBack?: () => void;
  onSaveExit?: () => void;
  primaryButtonText?: string;
  onPrimaryPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  skipText?: string;
  children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  totalSteps = 6,
  stepTitle,
  pageTitle,
  pageSubtitle,
  onBack,
  onSaveExit,
  primaryButtonText = 'Save & Continue',
  onPrimaryPress,
  loading = false,
  disabled = false,
  showSkip = false,
  onSkip,
  skipText = 'Skip for Now',
  children,
}) => {
  return (
    <View style={styles.container}>
      <ProgressHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle={stepTitle}
        onBack={onBack}
        onSaveExit={onSaveExit}
      />

      <StepContainer title={pageTitle} subtitle={pageSubtitle}>
        {children}
      </StepContainer>

      <StepFooter
        primaryText={primaryButtonText}
        onPrimaryPress={onPrimaryPress}
        loading={loading}
        disabled={disabled}
        showSkip={showSkip}
        onSkip={onSkip}
        skipText={skipText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
});
