import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Zap, ArrowRight, Clock, Sparkles } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

interface DeliveryContextCardProps {
  etaMinutes?: number;
  availableItemsCount?: number;
  areaName?: string;
  onPress?: () => void;
}

export const DeliveryContextCard: React.FC<DeliveryContextCardProps> = ({
  etaMinutes = 18,
  availableItemsCount = 247,
  areaName = 'Jaipur',
  onPress,
}) => {
  const handlePress = () => {
    triggerHaptic('light');
    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.container}
    >
      <View style={styles.leftRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.bikeEmoji}>🛵</Text>
        </View>

        <View style={styles.textContainer}>
          <View style={styles.etaRow}>
            <Text style={styles.etaTitle}>Arrives in ~{etaMinutes} min</Text>
            <View style={styles.liveBadge}>
              <Zap size={10} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.areaSubtitle}>
            Your area has <Text style={styles.highlightCount}>{availableItemsCount} items</Text> available right now
          </Text>
        </View>
      </View>

      <View style={styles.actionArrow}>
        <ArrowRight size={16} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.small,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  bikeEmoji: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  etaTitle: {
    ...Typography.titleSmall,
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginRight: 6,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 0.5,
    borderColor: '#6EE7B7',
  },
  liveBadgeText: {
    ...Typography.caption,
    fontSize: 8,
    fontWeight: '900',
    color: Colors.primary,
    marginLeft: 2,
  },
  areaSubtitle: {
    ...Typography.bodySmall,
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  highlightCount: {
    fontWeight: '800',
    color: '#065F46',
  },
  actionArrow: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
});
