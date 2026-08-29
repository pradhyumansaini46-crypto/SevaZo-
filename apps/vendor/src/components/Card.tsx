import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
}) => {
  const getStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: Colors.surface,
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: Colors.borderLight,
          ...Shadows.card,
        };
      case 'outlined':
        return {
          backgroundColor: Colors.surface,
          borderRadius: BorderRadius.lg,
          borderWidth: 1.2,
          borderColor: Colors.border,
        };
      case 'flat':
        return {
          backgroundColor: Colors.background,
          borderRadius: BorderRadius.lg,
        };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.card, getStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, getStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
});
