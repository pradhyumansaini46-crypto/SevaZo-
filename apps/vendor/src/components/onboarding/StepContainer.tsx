import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';

interface StepContainerProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  rejectionReason?: string | null;
  requiredAction?: string | null;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  icon,
  title,
  subtitle,
  rejectionReason,
  requiredAction,
  children,
  style,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);

  return (
    <View style={[styles.container, style]}>
      {/* Step Header */}
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
            {icon}
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>

      {/* Rejection / Correction Alert Banner */}
      {rejectionReason && (
        <View style={styles.rejectionCard}>
          <View style={styles.rejectionHeader}>
            <AlertTriangle size={16} color="#DC2626" />
            <Text style={styles.rejectionTitle}>Action Required on this Section</Text>
          </View>
          <Text style={styles.rejectionText}>Reason: {rejectionReason}</Text>
          {requiredAction && (
            <Text style={styles.actionText}>Instructions: {requiredAction}</Text>
          )}
        </View>
      )}

      {/* Main Step Form Body */}
      <View style={styles.body}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  rejectionCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: 14,
    borderRadius: BorderRadius.lg,
    marginBottom: 20,
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  rejectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  rejectionText: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 16,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    lineHeight: 16,
  },
  body: {
    width: '100%',
  },
});
