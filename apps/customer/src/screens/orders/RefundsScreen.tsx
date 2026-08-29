import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { CheckCircle2, RotateCcw, Wallet, ArrowRight } from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { RefundRecord } from '../../types';

export const RefundsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    const data = await customerApi.getRefunds();
    setRefunds(data);
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Refunds & Credits"
        subtitle="Track return refunds"
      />

      {refunds.length === 0 ? (
        <EmptyState
          icon={<RotateCcw size={36} color={Colors.primary} />}
          title="No Refunds Active"
          description="All your orders are delivered happily with zero refund claims."
          actionTitle="Go to Home"
          onAction={() => navigation.navigate('HomeTab')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {refunds.map((ref) => (
            <View key={ref.id} style={styles.refundCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <CheckCircle2 size={22} color={Colors.success} />
                  <View style={{ marginLeft: Spacing.sm }}>
                    <Text style={styles.orderNumber}>{ref.orderNumber}</Text>
                    <Text style={styles.refundDate}>{ref.createdAt}</Text>
                  </View>
                </View>

                <Badge label={ref.status} variant="success" />
              </View>

              <Text style={styles.reasonText}>Reason: {ref.reason}</Text>

              <View style={styles.payoutModeRow}>
                <Wallet size={16} color={Colors.secondary} />
                <Text style={styles.payoutModeText}>
                  Credited to {ref.payoutMode.replace(/_/g, ' ')}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.refLabel}>Transaction Ref</Text>
                  <Text style={styles.refValue}>{ref.transactionRef}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.refLabel}>Refund Amount</Text>
                  <Text style={styles.amountValue}>+₹{ref.amount}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  refundCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  refundDate: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  reasonText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  payoutModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  payoutModeText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.secondary,
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  refLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  refValue: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  amountValue: {
    ...Typography.titleMedium,
    fontWeight: '900',
    color: Colors.success,
  },
});
