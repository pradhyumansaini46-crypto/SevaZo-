import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { Button } from '../Button';

interface SaveContinueButtonProps {
  title?: string;
  isLastStep?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const SaveContinueButton: React.FC<SaveContinueButtonProps> = ({
  title,
  isLastStep = false,
  loading = false,
  disabled = false,
  onPress,
}) => {
  const resolvedTitle = title || (isLastStep ? 'Submit Application' : 'Save & Continue');
  const Icon = isLastStep ? CheckCircle2 : ArrowRight;

  return (
    <Button
      title={resolvedTitle}
      variant="primary"
      size="lg"
      fullWidth
      loading={loading}
      disabled={disabled || loading}
      onPress={onPress}
      rightIcon={<Icon size={18} color="#FFFFFF" />}
    />
  );
};
