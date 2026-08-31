import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { Colors, BorderRadius, Typography, Shadows, Spacing } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  icon,
  style,
  textStyle,
  fullWidth = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const isBusy = loading || isLoading;
  const isInteractive = !disabled && !isBusy;
  const effectiveRightIcon = rightIcon || icon;

  const normalizedSize = size === 'sm' || size === 'small' ? 'small' : size === 'md' || size === 'medium' ? 'medium' : 'large';

  const getContainerStyle = (): StyleProp<ViewStyle> => {
    const base: ViewStyle[] = [
      styles.base,
      styles[normalizedSize],
      fullWidth ? { width: '100%' } : {},
    ];

    switch (variant) {
      case 'primary':
        base.push(styles.primary);
        break;
      case 'secondary':
        base.push(styles.secondary);
        break;
      case 'outline':
        base.push(styles.outline);
        break;
      case 'success':
        base.push(styles.success);
        break;
      case 'danger':
        base.push(styles.danger);
        break;
      case 'ghost':
        base.push(styles.ghost);
        break;
    }

    if (!isInteractive) {
      base.push(styles.disabled);
    }

    return [base, style];
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const base: TextStyle[] = [
      styles.textBase,
      styles[`text_${normalizedSize}` as keyof typeof styles] as TextStyle,
    ];

    switch (variant) {
      case 'primary':
        base.push(styles.textPrimary);
        break;
      case 'secondary':
        base.push(styles.textSecondary);
        break;
      case 'outline':
        base.push(styles.textOutline);
        break;
      case 'success':
        base.push(styles.textSuccess);
        break;
      case 'danger':
        base.push(styles.textDanger);
        break;
      case 'ghost':
        base.push(styles.textGhost);
        break;
    }

    return [base, textStyle];
  };

  const getIndicatorColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'success':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return '#FF6600';
      case 'secondary':
        return Colors.textPrimary;
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: isBusy }}
    >
      {isBusy ? (
        <ActivityIndicator color={getIndicatorColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {effectiveRightIcon && <View style={styles.rightIconWrapper}>{effectiveRightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  leftIconWrapper: {
    marginRight: 2,
  },
  rightIconWrapper: {
    marginLeft: 2,
  },
  small: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 38,
  },
  medium: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  large: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  primary: {
    backgroundColor: '#FF6600',
    ...Shadows.glowOrange,
  },
  secondary: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FF6600',
  },
  success: {
    backgroundColor: '#10B981',
    ...Shadows.glowGreen,
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  textBase: {
    fontWeight: '700',
    textAlign: 'center',
  },
  text_small: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  text_medium: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  text_large: {
    ...Typography.bodyLarge,
    fontWeight: '800',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: Colors.textPrimary,
  },
  textOutline: {
    color: '#FF6600',
  },
  textSuccess: {
    color: '#FFFFFF',
  },
  textDanger: {
    color: '#FFFFFF',
  },
  textGhost: {
    color: '#FF6600',
  },
});

export default Button;
