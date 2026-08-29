import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Clock, AlertTriangle, ChevronRight, Lock } from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';

export type SectionState = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ACTION_REQUIRED' | 'LOCKED';

interface SectionStatusProps {
  stepNumber: number;
  title: string;
  subtitle?: string;
  status: SectionState;
  rejectionReason?: string | null;
  onPress?: () => void;
}

export const SectionStatus: React.FC<SectionStatusProps> = ({
  stepNumber,
  title,
  subtitle,
  status,
  rejectionReason,
  onPress,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);

  const getStatusBadge = () => {
    switch (status) {
      case 'COMPLETED':
      case 'VERIFIED':
        return {
          bg: '#ECFDF5',
          border: '#10B981',
          text: '#065F46',
          label: 'Completed',
          icon: <CheckCircle2 size={14} color="#10B981" />,
        };
      case 'IN_PROGRESS':
        return {
          bg: '#EFF6FF',
          border: '#3B82F6',
          text: '#1E40AF',
          label: 'In Progress',
          icon: <Clock size={14} color="#3B82F6" />,
        };
      case 'REJECTED':
      case 'ACTION_REQUIRED':
        return {
          bg: '#FEF2F2',
          border: '#EF4444',
          text: '#991B1B',
          label: 'Needs Action',
          icon: <AlertTriangle size={14} color="#EF4444" />,
        };
      case 'LOCKED':
        return {
          bg: '#F1F5F9',
          border: '#CBD5E1',
          text: '#64748B',
          label: 'Locked',
          icon: <Lock size={14} color="#64748B" />,
        };
      case 'PENDING':
      default:
        return {
          bg: '#F8FAFC',
          border: '#E2E8F0',
          text: '#64748B',
          label: 'Pending',
          icon: <Clock size={14} color="#94A3B8" />,
        };
    }
  };

  const badge = getStatusBadge();
  const isInteractive = Boolean(onPress && status !== 'LOCKED');

  return (
    <TouchableOpacity
      activeOpacity={isInteractive ? 0.7 : 1}
      onPress={isInteractive ? onPress : undefined}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: status === 'REJECTED' || status === 'ACTION_REQUIRED' ? '#EF4444' : colors.border,
        },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.stepBadge,
            {
              backgroundColor:
                status === 'COMPLETED' || status === 'VERIFIED'
                  ? colors.primaryLight
                  : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.stepNumber,
              {
                color:
                  status === 'COMPLETED' || status === 'VERIFIED'
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            {stepNumber}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
          {rejectionReason && (
            <Text style={styles.rejectionNotice}>⚠ {rejectionReason}</Text>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          {badge.icon}
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
        {isInteractive && <ChevronRight size={18} color={colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 10,
    ...Shadows.card,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  rejectionNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
