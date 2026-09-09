import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { ArrowRight, Activity, Zap, Store, Bike } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { SevazoPulseData } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

interface SevazoPulseProps {
  data?: SevazoPulseData;
  onExplore?: () => void;
  onPressExplore?: () => void;
}

export const SevazoPulse: React.FC<SevazoPulseProps> = ({
  data = {
    isActiveArea: true,
    areaName: 'Surya Nagar • Jaipur',
    productsAvailable: 247,
    storesOpen: 18,
    ridersNearby: 31,
    lastUpdated: 'Live right now',
  },
  onExplore,
  onPressExplore,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Activity size={14} color={Colors.primary} strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={styles.tagText}>SEVAZO PULSE</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.pulseDotWrapper}>
              <Animated.View
                style={[
                  styles.pulseHalo,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.35],
                      outputRange: [0.7, 0],
                    }),
                  },
                ]}
              />
              <View style={styles.pulseDot} />
            </View>
            <Text style={styles.statusText}>Your area is active</Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <View style={[styles.metricIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Zap size={14} color="#059669" />
            </View>
            <Text style={styles.metricNumber}>{data.productsAvailable}</Text>
            <Text style={styles.metricLabel}>products ready</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <View style={[styles.metricIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Store size={14} color="#2563EB" />
            </View>
            <Text style={styles.metricNumber}>{data.storesOpen}</Text>
            <Text style={styles.metricLabel}>stores open</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <View style={[styles.metricIconBox, { backgroundColor: '#FFF7ED' }]}>
              <Bike size={14} color="#EA580C" />
            </View>
            <Text style={styles.metricNumber}>{data.ridersNearby}</Text>
            <Text style={styles.metricLabel}>riders nearby</Text>
          </View>
        </View>

        {/* Bottom CTA Bar */}
        <TouchableOpacity
          activeOpacity={0.84}
          onPress={() => {
            triggerHaptic('light');
            (onPressExplore || onExplore)?.();
          }}
          style={styles.exploreBtn}
        >
          <Text style={styles.exploreText}>Explore live catalog</Text>
          <ArrowRight size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  pulseDotWrapper: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  pulseHalo: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricIconBox: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricNumber: {
    ...Typography.titleSmall,
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  metricLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 2,
  },
  exploreText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 4,
  },
});
