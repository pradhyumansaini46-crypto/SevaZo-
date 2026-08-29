import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProgressHeader } from './ProgressHeader';
import { StepFooter } from './StepFooter';
import { Colors } from '../../theme';

export interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps?: number;
  stepTitle: string;
  completionPercentage: number;
  onBack?: () => void;
  onClose?: () => void;
  onSaveContinue: () => void;
  onSaveExit?: () => void;
  continueTitle?: string;
  isLastStep?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  showSaveExit?: boolean;
  children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  totalSteps = 14,
  stepTitle,
  completionPercentage,
  onBack,
  onClose,
  onSaveContinue,
  onSaveExit,
  continueTitle,
  isLastStep = false,
  isLoading = false,
  disabled = false,
  showSaveExit = true,
  children,
}) => {
  const navigation = useNavigation<any>();

  const handleDefaultBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  const handleCancelToLogin = () => {
    if (onClose) {
      onClose();
    } else {
      // Directly redirect to Login / Registration page
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ProgressHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle={stepTitle}
        completionPercentage={completionPercentage}
        onBack={handleDefaultBack}
        onClose={handleCancelToLogin}
      />

      <View style={styles.content}>{children}</View>

      <StepFooter
        onSaveContinue={onSaveContinue}
        onSaveExit={onSaveExit || handleCancelToLogin}
        continueTitle={continueTitle}
        isLastStep={isLastStep}
        isLoading={isLoading}
        disabled={disabled}
        showSaveExit={showSaveExit}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});

export default OnboardingLayout;
