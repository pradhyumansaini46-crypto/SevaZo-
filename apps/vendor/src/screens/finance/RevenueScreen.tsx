import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  TrendingUp,
  CreditCard,
  Percent,
  Landmark,
  ArrowRight,
  Sparkles,
  Download,
} from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { MetricCard } from '../../components/MetricCard';
import { Button } from '../../components/Button';
import { VendorApi } from '../../services/vendorApi';

export const RevenueScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [summary, setSummary] = useState<any>({
    totalGrossSales: 284500.0,
    totalPlatformFee: 28450.0,
    totalEarnedPayout: 256050.0,
    settledAmount: 198000.0,
    pendingPayout: 58050.0,
    commissionRate: 10.0,
  });
  const [loading, setLoading] = useState(false);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await VendorApi.getFinanceSummary();
      setSummary(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Finance & Revenue"
        subtitle="Gross turnover, commission & net payouts"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSummary} />}
      >
        {/* Net Payout Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Total Net Merchant Payouts</Text>
            <View style={styles.commissionTag}>
              <Text style={styles.commissionTagText}>
                {summary.commissionRate}% Platform Fee
              </Text>
            </View>
          </View>
          <Text style={styles.heroAmount}>
            ₹{summary.totalEarnedPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.heroSub}>
            Direct transfers to your registered HDFC Bank account
          </Text>
        </View>

        {/* Breakdown Metric Cards */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Gross Sales"
            value={`₹${summary.totalGrossSales.toLocaleString()}`}
            subtitle="Customer order total"
            icon={<TrendingUp size={20} color={Colors.primary} />}
            style={{ marginRight: 8, marginBottom: 12 }}
          />

          <MetricCard
            title="SevaZo Platform Fee"
            value={`₹${summary.totalPlatformFee.toLocaleString()}`}
            subtitle="10% commission + GST"
            icon={<Percent size={20} color={Colors.secondary} />}
            iconBg={Colors.secondaryLight}
            style={{ marginLeft: 8, marginBottom: 12 }}
          />
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Settled"
            value={`₹${summary.settledAmount.toLocaleString()}`}
            subtitle="Credited to bank"
            icon={<Landmark size={20} color={Colors.success} />}
            iconBg={Colors.successLight}
            style={{ marginRight: 8 }}
          />

          <MetricCard
            title="Pending Next Payout"
            value={`₹${summary.pendingPayout.toLocaleString()}`}
            subtitle="Cycle ending Monday"
            icon={<Sparkles size={20} color="#B45309" />}
            iconBg="#FEF3C7"
            style={{ marginLeft: 8 }}
          />
        </View>

        {/* Quick Links */}
        <View style={styles.linksCard}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settlements')}
            style={styles.linkRow}
          >
            <View style={styles.linkLeft}>
              <Landmark size={20} color={Colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.linkTitle}>Settlement Bank Cycles</Text>
                <Text style={styles.linkSub}>View weekly bank transfers & UTR references</Text>
              </View>
            </View>
            <ArrowRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={() => navigation.navigate('Transactions')}
            style={styles.linkRow}
          >
            <View style={styles.linkLeft}>
              <CreditCard size={20} color={Colors.secondary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.linkTitle}>Itemized Order Ledger</Text>
                <Text style={styles.linkSub}>Order-by-order financial splits & invoices</Text>
              </View>
            </View>
            <ArrowRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.xl,
    padding: 20,
    marginBottom: 20,
    ...Shadows.elevated,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commissionTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  commissionTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 8,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  metricsGrid: {
    flexDirection: 'row',
  },
  linksCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: 16,
    ...Shadows.card,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  linkSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
});
