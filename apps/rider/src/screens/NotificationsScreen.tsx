import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, Zap, ShieldCheck, Gift, AlertTriangle } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

export const NotificationsScreen = () => {
  const notifs = [
    {
      id: '1',
      title: '⛈️ Monsoon Rain Incentive Active!',
      desc: 'Earn +₹25 extra per delivery order in South Delhi zone between 4 PM and 9 PM.',
      time: '15 mins ago',
      type: 'INCENTIVE',
    },
    {
      id: '2',
      title: '✅ Weekly Payout Processed',
      desc: '₹5,420.00 has been transferred to your registered UPI ID (rahul@okaxis).',
      time: '4 hours ago',
      type: 'PAYOUT',
    },
    {
      id: '3',
      title: '🛡️ Document Verification Approved',
      desc: 'Your updated Driving License has been approved by admin. Safe riding!',
      time: '1 day ago',
      type: 'KYC',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Notifications & Alerts</Text>
      <Text style={styles.headerSubtitle}>Surge updates, incentives, and fleet alerts</Text>

      <View style={styles.list}>
        {notifs.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
        ))}
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
  headerTitle: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  list: {
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  cardTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  cardDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
