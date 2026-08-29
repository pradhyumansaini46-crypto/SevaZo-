import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Button } from '../Button';

interface StepFooterProps {
  primaryText?: string;
  onPrimaryPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  secondaryText?: string;
  onSecondaryPress?: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
  skipText?: string;
}

export const StepFooter: React.FC<StepFooterProps> = ({
  primaryText = 'Save & Continue',
  onPrimaryPress,
  loading = false,
  disabled = false,
  secondaryText,
  onSecondaryPress,
  showSkip = false,
  onSkip,
  skipText = 'Skip for Now',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.sm : Spacing.md,
        },
      ]}
    >
      <Button
        title={primaryText}
        onPress={onPrimaryPress}
        loading={loading}
        disabled={disabled}
        size="lg"
        style={styles.primaryBtn}
      />

      {secondaryText && onSecondaryPress ? (
        <Button
          title={secondaryText}
          variant="outline"
          onPress={onSecondaryPress}
          size="md"
          style={styles.secondaryBtn}
        />
      ) : null}

      {showSkip && onSkip ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>{skipText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.small,
    gap: Spacing.sm,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  skipText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
