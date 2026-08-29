import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react-native';
import { SectionStatus as SectionStatusType } from '../../types';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { useThemeStore } from '../../store/themeStore';

export interface SectionStatusProps {
  status: SectionStatusType;
  rejectionReason?: string;
  showIcon?: boolean;
}

export const SectionStatus: React.FC<SectionStatusProps> = ({
  status,
  rejectionReason,
  showIcon = true,
}) => {
  const isDark = useThemeStore((state) => state.isDark);

  const getBadgeConfig = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'Completed',
          color: isDark ? '#10B981' : '#059669',
          bgColor: isDark ? '#052E16' : '#ECFDF5',
          borderColor: '#10B981',
          icon: <CheckCircle2 size={14} color={isDark ? '#10B981' : '#059669'} />,
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          color: isDark ? '#FF7A00' : '#EA580C',
          bgColor: isDark ? 'rgba(255, 102, 0, 0.15)' : '#FFF7ED',
          borderColor: '#FF6600',
          icon: <Clock size={14} color={isDark ? '#FF7A00' : '#EA580C'} />,
        };
      case 'REJECTED':
        return {
          label: 'Needs Attention',
          color: isDark ? '#EF4444' : '#DC2626',
          bgColor: isDark ? '#2A0E11' : '#FEF2F2',
          borderColor: '#EF4444',
          icon: <AlertTriangle size={14} color={isDark ? '#EF4444' : '#DC2626'} />,
        };
      case 'NOT_STARTED':
      default:
        return {
          label: 'Not Started',
          color: isDark ? '#94A3B8' : '#64748B',
          bgColor: isDark ? '#1E293B' : '#F1F5F9',
          borderColor: isDark ? '#334155' : '#E2E8F0',
          icon: <Circle size={14} color={isDark ? '#94A3B8' : '#64748B'} />,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
          },
        ]}
      >
        {showIcon && <View style={styles.icon}>{config.icon}</View>}
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      </View>
      {status === 'REJECTED' && rejectionReason && (
        <Text style={styles.reasonText}>Reason: {rejectionReason}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontWeight: '700',
  },
  reasonText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    fontSize: 11,
    marginTop: 2,
  },
});

export default SectionStatus;
