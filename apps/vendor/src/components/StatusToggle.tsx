import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { getThemeColors, BorderRadius, Shadows } from '../theme';
import { useThemeStore } from '../stores/themeStore';

interface StatusToggleProps {
  isOpen: boolean;
  onToggle: (nextState: boolean) => void;
  prepTimeMinutes?: number;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({
  isOpen,
  onToggle,
  prepTimeMinutes = 15,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';

  const containerBg = isOpen
    ? isDark
      ? '#064E3B'
      : '#E3FDF5' // User specified Mint palette
    : isDark
    ? '#450A0A'
    : '#FFE6FA'; // User specified soft lavender/rose palette

  const containerBorder = isOpen
    ? isDark
      ? '#059669'
      : '#A7F3D0'
    : isDark
    ? '#991B1B'
    : '#FECDD3';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: containerBg,
          borderColor: containerBorder,
        },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.indicatorDot,
            { backgroundColor: isOpen ? colors.success : colors.danger },
          ]}
        />
        <View>
          <Text
            style={[
              styles.title,
              { color: isDark ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            Store is {isOpen ? 'OPEN & TAKING ORDERS' : 'CLOSED / OFFLINE'}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? '#E2E8F0' : colors.textSecondary },
            ]}
          >
            {isOpen
              ? `Avg Prep: ${prepTimeMinutes} mins • Auto-dispatch active`
              : 'Tap switch to resume instant order receiving'}
          </Text>
        </View>
      </View>
      <Switch
        trackColor={{ false: '#64748B', true: colors.primary }}
        thumbColor={isOpen ? '#FFFFFF' : '#CBD5E1'}
        ios_backgroundColor="#64748B"
        onValueChange={onToggle}
        value={isOpen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1.5,
    ...Shadows.subtle,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
});
