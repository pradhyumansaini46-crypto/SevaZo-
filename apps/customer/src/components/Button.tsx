import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = styles.base;

    // Size
    if (size === 'sm') base = { ...base, ...styles.sizeSm };
    if (size === 'md') base = { ...base, ...styles.sizeMd };
    if (size === 'lg') base = { ...base, ...styles.sizeLg };

    // Variant
    switch (variant) {
      case 'primary':
        base = { ...base, backgroundColor: Colors.primary };
        break;
      case 'secondary':
        base = { ...base, backgroundColor: Colors.secondary };
        break;
      case 'outline':
        base = { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary };
        break;
      case 'danger':
        base = { ...base, backgroundColor: Colors.danger };
        break;
      case 'ghost':
        base = { ...base, backgroundColor: 'transparent' };
        break;
    }

    if (disabled || loading) {
      base = { ...base, opacity: 0.6 };
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let text: TextStyle = { ...Typography.bodyLarge, fontWeight: '700' };

    if (size === 'sm') text = { ...text, fontSize: 13 };
    if (size === 'lg') text = { ...text, fontSize: 16 };

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        text = { ...text, color: Colors.textInverse };
        break;
      case 'outline':
      case 'ghost':
        text = { ...text, color: Colors.primary };
        break;
    }

    return text;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textInverse}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' ? <>{icon}</> : null}
          <Text style={[getTextStyle(), icon ? (iconPosition === 'left' ? { marginLeft: 8 } : { marginRight: 8 }) : undefined, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' ? <>{icon}</> : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  sizeSm: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  sizeMd: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  sizeLg: {
    paddingVertical: Spacing.lg - 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
});
