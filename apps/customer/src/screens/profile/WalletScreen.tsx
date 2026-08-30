import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Gift,
} from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { WalletTransaction } from '../../types';
import { useAuthStore } from '../../stores/authStore';

export const WalletScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { customer, updateProfile } = useAuthStore();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    const data = await customerApi.getWalletTransactions();
    setTransactions(data);
  };

  const handleTopUp = async () => {
    const numericAmount = parseInt(amountToAdd, 10);
    if (!numericAmount || numericAmount <= 0) return;

    setAdding(true);
    await customerApi.addWalletFunds(numericAmount);
    const newBal = (customer?.walletBalance || 0) + numericAmount;
    updateProfile({ walletBalance: newBal });

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'CREDIT',
      title: 'Added to Wallet',
      description: 'UPI Top-Up via Google Pay',
      amount: numericAmount,
      balanceAfter: newBal,
      createdAt: 'Just now',
    };
    setTransactions([newTx, ...transactions]);
    setAdding(false);
    setTopUpModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="SevaZo Wallet"
        subtitle="1-Click checkout & cashbacks"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Wallet Balance Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.iconCircle}>
              <Wallet size={24} color={Colors.textInverse} />
            </View>
            <View style={styles.cashbackBadge}>
              <Sparkles size={12} color="#FEF3C7" />
              <Text style={styles.cashbackText}>5% EXTRA CASHBACK</Text>
            </View>
          </View>

          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>₹{customer?.walletBalance || 450}</Text>

          {/* Quick Add Pills */}
          <View style={styles.quickAddRow}>
            {['100', '500', '1000'].map((amt) => (
              <TouchableOpacity
                key={amt}
                activeOpacity={0.8}
                onPress={() => {
                  setAmountToAdd(amt);
                  setTopUpModalVisible(true);
                }}
                style={styles.quickPill}
              >
                <Plus size={12} color={Colors.textInverse} />
                <Text style={styles.quickPillText}>+ ₹{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <Gift size={20} color={Colors.secondary} style={{ marginRight: Spacing.sm }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.benefitsTitle}>Why use SevaZo Wallet?</Text>
            <Text style={styles.benefitsSub}>
              Zero payment failure, fastest 1-second checkout, and instant refund credits on cancelled orders.
            </Text>
          </View>
        </View>

        {/* Transaction History */}
        <Text style={styles.sectionHeading}>Transaction History</Text>

        {transactions.map((tx) => {
          const isCredit = tx.type === 'CREDIT';
          return (
            <View key={tx.id} style={styles.txCard}>
              <View style={styles.txLeft}>
                <View
                  style={[
                    styles.txIconWrap,
                    { backgroundColor: isCredit ? Colors.successLight : Colors.dangerLight },
                  ]}
                >
                  {isCredit ? (
                    <ArrowDownLeft size={18} color={Colors.success} />
                  ) : (
                    <ArrowUpRight size={18} color={Colors.danger} />
                  )}
                </View>
                <View>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txDesc}>{tx.description}</Text>
                  <Text style={styles.txTime}>{tx.createdAt}</Text>
                </View>
              </View>

              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,
                    { color: isCredit ? Colors.success : Colors.textPrimary },
                  ]}
                >
                  {isCredit ? '+' : '-'}₹{tx.amount}
                </Text>
                <Text style={styles.txBalAfter}>Bal: ₹{tx.balanceAfter}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Top Up Modal */}
      <Modal
        visible={topUpModalVisible}
        onClose={() => setTopUpModalVisible(false)}
        title="Add Money to Wallet"
        footer={
          <Button
            title={`Proceed to Pay ₹${amountToAdd || 0}`}
            onPress={handleTopUp}
            loading={adding}
            size="md"
          />
        }
      >
        <Text style={styles.modalLabel}>Enter Amount (₹)</Text>
        <Input
          placeholder="e.g. 500"
          keyboardType="number-pad"
          value={amountToAdd}
          onChangeText={setAmountToAdd}
        />
      </Modal>
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
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  cashbackText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#FEF3C7',
    marginLeft: 4,
  },
  balanceLabel: {
    ...Typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: Spacing.xs,
  },
  balanceValue: {
    ...Typography.hero,
    fontSize: 36,
    color: Colors.textInverse,
    fontWeight: '900',
    marginVertical: 4,
  },
  quickAddRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  quickPillText: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.textInverse,
    marginLeft: 3,
  },
  benefitsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  benefitsTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  benefitsSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  txTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  txDesc: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 1,
  },
  txTime: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    ...Typography.bodyLarge,
    fontWeight: '900',
  },
  txBalAfter: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalLabel: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
});
