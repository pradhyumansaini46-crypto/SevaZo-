import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getThemeColors, BorderRadius, Shadows } from '../theme';
import { useThemeStore } from '../stores/themeStore';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: string;
  trendPositive?: boolean;
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  trend,
  trendPositive = true,
  style,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: iconBg || colors.primaryLight },
          ]}
        >
          {icon}
        </View>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: trendPositive ? colors.successLight : colors.dangerLight },
            ]}
          >
            <Text
              style={[
                styles.trendText,
                { color: trendPositive ? colors.success : colors.danger },
              ]}
            >
              {trend}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flex: 1,
    minWidth: 140,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});
