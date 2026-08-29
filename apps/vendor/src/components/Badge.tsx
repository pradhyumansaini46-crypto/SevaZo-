import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius } from '../theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
  textStyle,
  dot = false,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: Colors.successLight, text: Colors.success, dotColor: Colors.success };
      case 'warning':
        return { bg: Colors.warningLight, text: '#B45309', dotColor: Colors.warning };
      case 'danger':
        return { bg: Colors.dangerLight, text: Colors.danger, dotColor: Colors.danger };
      case 'info':
        return { bg: Colors.infoLight, text: Colors.info, dotColor: Colors.info };
      case 'secondary':
        return { bg: Colors.secondaryLight, text: Colors.secondary, dotColor: Colors.secondary };
      case 'neutral':
      default:
        return { bg: Colors.borderLight, text: Colors.textSecondary, dotColor: Colors.textSecondary };
    }
  };

  const { bg, text, dotColor } = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, paddingVertical: size === 'sm' ? 2 : 4, paddingHorizontal: size === 'sm' ? 6 : 10 },
        style,
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
      <Text
        style={[
          styles.badgeText,
          { color: text, fontSize: size === 'sm' ? 11 : 12 },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  badgeText: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
