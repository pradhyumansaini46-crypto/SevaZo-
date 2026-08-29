import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { CreditCard, ArrowDownLeft } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Commission } from '../../types';
import { VendorApi } from '../../services/vendorApi';

export const TransactionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await VendorApi.getTransactions();
      setTransactions(res.items);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Transactions Ledger"
        subtitle="Order earnings & platform commission breakdown"
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTransactions} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.orderNumber}>Order #{item.order?.orderNumber}</Text>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.payoutAmount}>+₹{item.vendorPayout}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gross Amount:</Text>
              <Text style={styles.detailVal}>₹{item.orderAmount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Platform Fee (10%):</Text>
              <Text style={[styles.detailVal, { color: Colors.danger }]}>-₹{item.commissionFee}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Net Credited:</Text>
              <Text style={[styles.detailVal, { fontWeight: '700', color: Colors.primaryDark }]}>
                ₹{item.vendorPayout}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="💳"
            title="No Transactions"
            description="Completed customer orders will appear in this ledger."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  payoutAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailVal: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
});
