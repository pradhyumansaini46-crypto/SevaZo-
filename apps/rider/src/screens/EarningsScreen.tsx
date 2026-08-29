import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Wallet, ArrowDownRight, TrendingUp, Calendar, ArrowUpRight, DollarSign } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useAuthStore } from '../store/authStore';

type EarningsPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'PAYOUTS';

export const EarningsScreen = () => {
  const { rider } = useAuthStore();
  const [period, setPeriod] = useState<EarningsPeriod>('TODAY');

  const getStats = () => {
    switch (period) {
      case 'TODAY':
        return { total: '₹1,240.00', trips: 10, tips: '₹180.00', surge: '₹120.00' };
      case 'WEEK':
        return { total: '₹8,650.00', trips: 72, tips: '₹940.00', surge: '₹850.00' };
      case 'MONTH':
        return { total: '₹34,800.00', trips: 288, tips: '₹3,400.00', surge: '₹3,100.00' };
      case 'PAYOUTS':
        return { total: '₹1,845.50', trips: 0, tips: '₹0', surge: '₹0' };
    }
  };

  const current = getStats();

  return (
    <View style={styles.container}>
      {/* Point 38 Earnings Selector */}
      <View style={styles.tabBar}>
        {[
          { id: 'TODAY', label: 'Today' },
          { id: 'WEEK', label: 'This Week' },
          { id: 'MONTH', label: 'This Month' },
          { id: 'PAYOUTS', label: 'Payouts' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, period === tab.id && styles.tabItemActive]}
            onPress={() => setPeriod(tab.id as EarningsPeriod)}
          >
            <Text style={[styles.tabText, period === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Wallet Balance Hero Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <View>
              <Text style={styles.walletLabel}>
                {period === 'PAYOUTS' ? 'WITHDRAWABLE BALANCE' : `${period} EARNINGS`}
              </Text>
              <Text style={styles.walletAmount}>
                {period === 'PAYOUTS' ? `₹${rider?.walletBalance?.toFixed(2) || '1,845.50'}` : current.total}
              </Text>
            </View>
            <View style={styles.walletIcon}>
              <Wallet size={24} color="#38BDF8" />
            </View>
          </View>

          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.withdrawText}>Request Instant UPI Payout</Text>
            <ArrowDownRight size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Breakdown Grid */}
        <Text style={styles.sectionTitle}>Breakdown</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryVal}>{current.trips}</Text>
            <Text style={styles.summaryLabel}>Total Trips</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryVal}>{current.tips}</Text>
            <Text style={styles.summaryLabel}>Customer Tips</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryVal}>{current.surge}</Text>
            <Text style={styles.summaryLabel}>Peak Bonus</Text>
          </View>
        </View>

        {/* Itemized Transactions Ledger */}
        <Text style={styles.sectionTitle}>Recent Settlements</Text>
        {[
          { id: '1', order: 'SVZ-20260822-5001', time: 'Today, 1:40 PM', amount: '+₹85.00', type: 'Delivery Earning' },
          { id: '2', order: 'SVZ-20260821-4921', time: 'Yesterday, 3:15 PM', amount: '+₹68.50', type: 'Delivery Earning' },
          { id: '3', order: 'UPI-SETTLE-8812', time: 'Yesterday, 8:00 PM', amount: '-₹1,200.00', type: 'Bank Payout' },
          { id: '4', order: 'RAIN-INCENTIVE-9', time: '20 Aug, 6:30 PM', amount: '+₹150.00', type: 'Peak Shift Bonus' },
        ].map((txn) => (
          <View key={txn.id} style={styles.txnCard}>
            <View>
              <Text style={styles.txnOrder}>{txn.order}</Text>
              <Text style={styles.txnType}>{txn.type} • {txn.time}</Text>
            </View>
            <Text style={[styles.txnAmount, txn.amount.startsWith('+') ? styles.positive : styles.negative]}>
              {txn.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FF6600',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  walletCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FF6600',
    marginBottom: Spacing.xl,
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  walletLabel: {
    ...Typography.caption,
    color: '#EA580C',
    fontWeight: '800',
  },
  walletAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawButton: {
    backgroundColor: '#FF6600',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  withdrawText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  txnCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  txnOrder: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  txnType: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  positive: {
    color: '#059669',
  },
  negative: {
    color: '#EF4444',
  },
});
