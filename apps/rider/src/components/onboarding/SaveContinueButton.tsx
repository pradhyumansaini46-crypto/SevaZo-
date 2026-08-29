import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowRight, Check } from 'lucide-react-native';
import { Button, ButtonProps } from '../Button';

export interface SaveContinueButtonProps extends Omit<ButtonProps, 'title'> {
  title?: string;
  isLastStep?: boolean;
}

export const SaveContinueButton: React.FC<SaveContinueButtonProps> = ({
  title,
  isLastStep = false,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  ...rest
}) => {
  const defaultTitle = isLastStep ? 'Submit Application' : 'Save & Continue';
  const icon = isLastStep ? (
    <Check size={20} color="#FFFFFF" />
  ) : (
    <ArrowRight size={20} color="#FFFFFF" />
  );

  return (
    <Button
      title={title || defaultTitle}
      variant="primary"
      size="large"
      onPress={onPress}
      isLoading={isLoading}
      disabled={disabled}
      rightIcon={icon}
      style={[styles.button, style]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
  },
});

export default SaveContinueButton;
