import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { getThemeColors } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { ProgressHeader } from './ProgressHeader';
import { StepFooter } from './StepFooter';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps?: number;
  stepTitle: string;
  categoryTitle?: string;
  progressPercentage: number;
  loading?: boolean;
  canContinue?: boolean;
  continueTitle?: string;
  onBack?: () => void;
  onContinue: () => void;
  onSaveAndExit?: () => void;
  children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  totalSteps = 13,
  stepTitle,
  categoryTitle,
  progressPercentage,
  loading = false,
  canContinue = true,
  continueTitle,
  onBack,
  onContinue,
  onSaveAndExit,
  children,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);

  const handleSaveAndExitConfirm = () => {
    if (onSaveAndExit) {
      onSaveAndExit();
      return;
    }

    Alert.alert(
      'Save & Exit Application?',
      'Your application progress has been securely saved to Sevazo Cloud. You can resume anytime by logging into your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit Application',
          style: 'destructive',
          onPress: () => {
            // Default exit handled by parent or navigation
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Fixed Progress Header */}
      <ProgressHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle={stepTitle}
        categoryTitle={categoryTitle}
        progressPercentage={progressPercentage}
        onBack={onBack}
        onSaveAndExit={handleSaveAndExitConfirm}
      />

      {/* Scrollable Form Body with Keyboard Avoidance */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Fixed Action Footer */}
      <StepFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        loading={loading}
        disabled={!canContinue}
        onBack={onBack}
        onContinue={onContinue}
        continueTitle={continueTitle}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
