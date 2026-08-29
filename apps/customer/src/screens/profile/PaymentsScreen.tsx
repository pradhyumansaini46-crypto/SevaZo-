import React, { useState } from 'react';
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
import { CreditCard, Zap, Plus, Trash2, ShieldCheck } from 'lucide-react-native';

export const PaymentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [upiList, setUpiList] = useState([
    { id: 'u-1', handle: 'aarav.sharma@okhdfcbank', app: 'Google Pay', isDefault: true },
    { id: 'u-2', handle: '9876543210@paytm', app: 'Paytm UPI', isDefault: false },
  ]);

  const [cardList, setCardList] = useState([
    { id: 'c-1', number: '•••• •••• •••• 4242', holder: 'AARAV SHARMA', expiry: '10/28', type: 'Visa Platinum' },
    { id: 'c-2', number: '•••• •••• •••• 8890', holder: 'AARAV SHARMA', expiry: '06/29', type: 'MasterCard World' },
  ]);

  const deleteUpi = (id: string) => {
    setUpiList(upiList.filter((u) => u.id !== id));
  };

  const deleteCard = (id: string) => {
    setCardList(cardList.filter((c) => c.id !== id));
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Payment Methods"
        subtitle="Manage saved UPI & cards"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* UPI Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved UPI Handles</Text>
        </View>

        {upiList.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}>
                <Zap size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.upiHandle}>{item.handle}</Text>
                <Text style={styles.upiApp}>{item.app}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => deleteUpi(item.id)} style={styles.trashBtn}>
              <Trash2 size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Cards Section */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
          <Text style={styles.sectionTitle}>Saved Debit & Credit Cards</Text>
        </View>

        {cardList.map((card) => (
          <View key={card.id} style={styles.creditCardBox}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardType}>{card.type}</Text>
              <TouchableOpacity onPress={() => deleteCard(card.id)}>
                <Trash2 size={16} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            <Text style={styles.cardNumber}>{card.number}</Text>

            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                <Text style={styles.cardVal}>{card.holder}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>EXPIRES</Text>
                <Text style={styles.cardVal}>{card.expiry}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.securityBox}>
          <ShieldCheck size={18} color={Colors.success} style={{ marginRight: 8 }} />
          <Text style={styles.securityText}>
            Sevazo complies with RBI Card-On-File Tokenization (CoFT) rules.
          </Text>
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
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  card: {
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
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  upiHandle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  upiApp: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 1,
  },
  trashBtn: {
    padding: Spacing.xs,
  },
  creditCardBox: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardType: {
    ...Typography.caption,
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '800',
  },
  cardNumber: {
    ...Typography.titleLarge,
    color: Colors.textInverse,
    letterSpacing: 2,
    marginVertical: Spacing.md,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    ...Typography.caption,
    fontSize: 8,
    color: '#94A3B8',
  },
  cardVal: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textInverse,
    fontWeight: '700',
    marginTop: 2,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  securityText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
});
