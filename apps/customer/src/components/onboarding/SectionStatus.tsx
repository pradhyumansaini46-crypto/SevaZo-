import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { CheckCircle2, Clock, CircleDot } from 'lucide-react-native';

export type StepState = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';

interface SectionStatusProps {
  label: string;
  status: StepState;
}

export const SectionStatus: React.FC<SectionStatusProps> = ({ label, status }) => {
  const getIcon = () => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 size={18} color={Colors.success} />;
      case 'IN_PROGRESS':
        return <CircleDot size={18} color={Colors.primary} />;
      case 'PENDING':
      default:
        return <Clock size={18} color={Colors.textMuted} />;
    }
  };

  return (
    <View style={[styles.container, status === 'IN_PROGRESS' && styles.activeContainer]}>
      {getIcon()}
      <Text
        style={[
          styles.labelText,
          status === 'COMPLETED' && styles.completedText,
          status === 'IN_PROGRESS' && styles.activeText,
          status === 'PENDING' && styles.pendingText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  activeContainer: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  labelText: {
    ...Typography.bodySmall,
    marginLeft: Spacing.sm,
  },
  completedText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activeText: {
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  pendingText: {
    color: Colors.textMuted,
  },
});
