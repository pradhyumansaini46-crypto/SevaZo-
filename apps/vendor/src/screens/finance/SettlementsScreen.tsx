import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Landmark, CheckCircle, Clock } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { Settlement } from '../../types';
import { VendorApi } from '../../services/vendorApi';
import { useAuthStore } from '../../stores/authStore';

export const SettlementsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { vendor } = useAuthStore();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSettlements = async () => {
    setLoading(true);
    try {
      const list = await VendorApi.getSettlements();
      setSettlements(list);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Settlement Cycles"
        subtitle="Weekly bank transfers & UTR statements"
        onBack={() => navigation.goBack()}
      />

      {/* Bank Account Info Card */}
      <View style={styles.bankCard}>
        <View style={styles.bankHeader}>
          <Landmark size={20} color={Colors.primary} />
          <Text style={styles.bankTitle}>Registered Payout Bank</Text>
        </View>
        <Text style={styles.bankAcc}>
          {vendor?.bankAccount?.bankName || 'HDFC Bank'} • {vendor?.bankAccount?.accountNumber || '•••• •••• 6789'}
        </Text>
        <Text style={styles.bankHolder}>
          IFSC: {vendor?.bankAccount?.ifsc || 'HDFC0001234'} • {vendor?.bankAccount?.accountHolder || vendor?.ownerName}
        </Text>
      </View>

      <FlatList
        data={settlements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSettlements} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.periodText}>
                  Cycle: {new Date(item.periodStart).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                  {new Date(item.periodEnd).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>
                {item.bankReference ? (
                  <Text style={styles.refText}>UTR: {item.bankReference}</Text>
                ) : (
                  <Text style={styles.refText}>Scheduled for Bank NEFT</Text>
                )}
              </View>

              <Badge
                label={item.status}
                variant={item.status === 'SETTLED' ? 'success' : 'warning'}
                dot
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Net Transferred</Text>
                <Text style={styles.amount}>₹{item.netPayout.toLocaleString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Gross Sales: ₹{item.totalGrossSales.toLocaleString()}</Text>
                <Text style={styles.fee}>Platform Fee: -₹{item.totalCommission.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bankCard: {
    backgroundColor: Colors.surface,
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bankTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  bankAcc: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bankHolder: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
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
  periodText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  refText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  label: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  fee: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 2,
  },
});
