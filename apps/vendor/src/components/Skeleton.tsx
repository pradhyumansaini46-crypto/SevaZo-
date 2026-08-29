import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { BorderRadius } from '../theme';
import { useThemeStore } from '../stores/themeStore';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const { themeMode } = useThemeStore();
  const isDark = themeMode === 'DARK';

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#334155' : '#E2E8F0',
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    opacity: 0.7,
  },
});
