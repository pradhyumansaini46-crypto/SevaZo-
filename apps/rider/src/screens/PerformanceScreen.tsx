import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Star, Award, TrendingUp, CheckCircle, ShieldCheck, Zap } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useAuthStore } from '../store/authStore';

export const PerformanceScreen = () => {
  const { rider } = useAuthStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Overall Score Badge */}
      <View style={styles.scoreCard}>
        <View style={styles.tierBadge}>
          <Award size={16} color="#0F172A" />
          <Text style={styles.tierText}>DIAMOND FLEET PARTNER</Text>
        </View>
        <Text style={styles.ratingNumber}>4.92</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={18} color="#F59E0B" fill="#F59E0B" />
          ))}
        </View>
        <Text style={styles.scoreSubtext}>Based on 342 customer ratings & merchant reviews</Text>
      </View>

      {/* KPI Metrics */}
      <Text style={styles.sectionTitle}>Key Operational Metrics</Text>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>98.4%</Text>
          <Text style={styles.kpiLabel}>Acceptance Rate</Text>
          <Text style={styles.kpiStatus}>Target: &gt;90% ✅</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>99.1%</Text>
          <Text style={styles.kpiLabel}>On-Time Delivery</Text>
          <Text style={styles.kpiStatus}>Target: &gt;95% ✅</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>0.2%</Text>
          <Text style={styles.kpiLabel}>Cancellation Rate</Text>
          <Text style={styles.kpiStatus}>Target: &lt;1% ✅</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>14 min</Text>
          <Text style={styles.kpiLabel}>Average ETA</Text>
          <Text style={styles.kpiStatus}>Top 5% in Zone 🚀</Text>
        </View>
      </View>

      {/* Badges & Achievements */}
      <Text style={styles.sectionTitle}>Partner Achievements</Text>
      <View style={styles.badgeList}>
        <View style={styles.badgeItem}>
          <Zap size={24} color="#F59E0B" />
          <View style={styles.badgeInfo}>
            <Text style={styles.badgeTitle}>Speed Demon</Text>
            <Text style={styles.badgeDesc}>Completed 100+ deliveries under 15 minutes</Text>
          </View>
        </View>
        <View style={styles.badgeItem}>
          <ShieldCheck size={24} color="#22C55E" />
          <View style={styles.badgeInfo}>
            <Text style={styles.badgeTitle}>Zero Mishap Driver</Text>
            <Text style={styles.badgeDesc}>Zero food spills or package damages over 300 trips</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  tierBadge: {
    backgroundColor: '#38BDF8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: Spacing.xs,
  },
  scoreSubtext: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  kpiCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#38BDF8',
  },
  kpiLabel: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 4,
  },
  kpiStatus: {
    fontSize: 11,
    color: '#22C55E',
    marginTop: 4,
  },
  badgeList: {
    gap: Spacing.md,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badgeDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
