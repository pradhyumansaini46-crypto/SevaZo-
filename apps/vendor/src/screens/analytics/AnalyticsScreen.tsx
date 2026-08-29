import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingUp, Award, Clock, ThumbsUp } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { MetricCard } from '../../components/MetricCard';
import { VendorApi } from '../../services/vendorApi';

export const AnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [analytics, setAnalytics] = useState<any>({
    salesTrend: [
      { date: 'Mon', sales: 12400 },
      { date: 'Tue', sales: 15800 },
      { date: 'Wed', sales: 14200 },
      { date: 'Thu', sales: 18900 },
      { date: 'Fri', sales: 24500 },
      { date: 'Sat', sales: 31200 },
      { date: 'Sun', sales: 28400 },
    ],
    topProducts: [
      { name: 'Organic Ratnagiri Alphonso Mangoes', quantity: 94, revenue: 32806 },
      { name: 'Farm Fresh Organic Whole Milk', quantity: 142, revenue: 11076 },
      { name: 'Cold Pressed Extra Virgin Olive Oil', quantity: 18, revenue: 16020 },
      { name: 'Artisanal Sourdough Country Loaf', quantity: 38, revenue: 6840 },
    ],
    fulfillmentRate: 98.4,
    cancellationRate: 1.6,
    averagePrepTimeMinutes: 12,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await VendorApi.getAnalytics();
        setAnalytics(data);
      } catch {
        // fallback
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Store Analytics & Insights"
        subtitle="Performance, top sellers & operational KPIs"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Operational Quality Metric Cards */}
        <View style={styles.grid}>
          <MetricCard
            title="Order Fulfillment"
            value={`${analytics.fulfillmentRate}%`}
            subtitle="Completed on time"
            icon={<Award size={20} color={Colors.primary} />}
            style={{ marginRight: 8, marginBottom: 12 }}
          />

          <MetricCard
            title="Average Prep Time"
            value={`${analytics.averagePrepTimeMinutes}m`}
            subtitle="From accept to ready"
            icon={<Clock size={20} color={Colors.secondary} />}
            iconBg={Colors.secondaryLight}
            style={{ marginLeft: 8, marginBottom: 12 }}
          />
        </View>

        {/* 7-Day Weekly Sales Chart Visual */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 7-Day Sales Trend</Text>
          <View style={styles.chartContainer}>
            {analytics.salesTrend.map((item: any) => {
              const max = 35000;
              const heightPct = Math.min(100, Math.max(15, (item.sales / max) * 100));
              return (
                <View key={item.date} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${heightPct}%` }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.date}</Text>
                  <Text style={styles.barVal}>₹{(item.sales / 1000).toFixed(0)}k</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top 5 Best Sellers */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Top Selling Products</Text>
          {analytics.topProducts.map((p: any, idx: number) => (
            <View key={p.name} style={styles.productRow}>
              <Text style={styles.rankNum}>#{idx + 1}</Text>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.prodName}>{p.name}</Text>
                <Text style={styles.prodQty}>{p.quantity} units sold</Text>
              </View>
              <Text style={styles.prodRev}>₹{p.revenue.toLocaleString()}</Text>
            </View>
          ))}
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
  grid: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 10,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 90,
    width: 14,
    backgroundColor: Colors.borderLight,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 6,
  },
  barVal: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rankNum: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    width: 28,
  },
  prodName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  prodQty: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  prodRev: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
