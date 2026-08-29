import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors, BorderRadius, Typography, Shadows } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  icon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const effectiveRightIcon = rightIcon || icon;
  const getContainerStyle = (): ViewStyle => {
    let bg: string = Colors.primary;
    let borderColor: string | undefined = undefined;
    let borderWidth = 0;

    switch (variant) {
      case 'primary':
        bg = Colors.primary;
        break;
      case 'secondary':
        bg = Colors.secondary;
        break;
      case 'outline':
        bg = 'transparent';
        borderColor = Colors.border;
        borderWidth = 1.5;
        break;
      case 'danger':
        bg = Colors.danger;
        break;
      case 'success':
        bg = Colors.success;
        break;
      case 'ghost':
        bg = 'transparent';
        break;
    }

    let paddingVertical = 12;
    let paddingHorizontal = 18;

    if (size === 'sm') {
      paddingVertical = 8;
      paddingHorizontal = 12;
    } else if (size === 'lg') {
      paddingVertical = 16;
      paddingHorizontal = 24;
    }

    return {
      backgroundColor: bg,
      borderColor,
      borderWidth,
      paddingVertical,
      paddingHorizontal,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : undefined,
      ...(variant === 'primary' ? Shadows.primaryGlow : {}),
    };
  };

  const getTextStyle = (): TextStyle => {
    let color = Colors.textInverse;

    if (variant === 'outline') {
      color = Colors.textPrimary;
    } else if (variant === 'ghost') {
      color = Colors.primary;
    }

    let fontSize = 15;
    if (size === 'sm') fontSize = 13;
    if (size === 'lg') fontSize = 17;

    return {
      color,
      fontSize,
      fontWeight: '600',
    };
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
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#FFFFFF'}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {effectiveRightIcon && <View style={styles.rightIcon}>{effectiveRightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
