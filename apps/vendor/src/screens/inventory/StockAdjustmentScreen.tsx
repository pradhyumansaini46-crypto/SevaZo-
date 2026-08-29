import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Check, ArrowRight, Calculator } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { VendorApi } from '../../services/vendorApi';

const TX_TYPES = [
  { id: 'PURCHASE', label: 'Inward Purchase (+)', desc: 'Received fresh distributor stock' },
  { id: 'ADJUSTMENT', label: 'Physical Audit (±)', desc: 'Manual stock cycle count match' },
  { id: 'DAMAGE', label: 'Damaged / Expired (+)', desc: 'Mark spoiled stock (reduces available)' },
  { id: 'RETURN', label: 'Customer Return (+)', desc: 'Restock returned item from customer' },
];

export const StockAdjustmentScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { productId, variantId } = route.params || {};

  const [product, setProduct] = useState<any>(null);
  const [txType, setTxType] = useState('PURCHASE');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (productId) {
        try {
          const prod = await VendorApi.getProduct(productId);
          setProduct(prod);
        } catch {
          // fallback
        }
      }
    };
    load();
  }, [productId]);

  const handleAdjust = async () => {
    const qty = parseInt(quantity, 10);
    if (!qty || isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid positive quantity.');
      return;
    }

    setLoading(true);
    try {
      await VendorApi.adjustStock({
        productId: productId || product?.id,
        variantId,
        changeQty: txType === 'DAMAGE' ? qty : txType === 'ADJUSTMENT' ? qty : qty,
        reason: txType,
        notes,
      });

      Alert.alert(
        'Inventory Updated',
        `Stock transaction [${txType}] recorded with formula recalculation.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Adjustment Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Stock Movement & Adjustment"
        subtitle={product ? `${product.name} (SKU: ${product.sku})` : 'Audit Stock Engine'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Transaction Type Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Transaction Reason</Text>
          {TX_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTxType(t.id)}
              style={[styles.typeRow, txType === t.id && styles.typeRowActive]}
            >
              <View style={[styles.radio, txType === t.id && styles.radioActive]}>
                {txType === t.id && <View style={styles.radioInner} />}
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.typeLabel, txType === t.id && styles.typeLabelActive]}>
                  {t.label}
                </Text>
                <Text style={styles.typeDesc}>{t.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quantity and Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔢 Quantity & Audit Reference</Text>
          <Input
            label="Quantity Units *"
            placeholder="10"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          <Input
            label="Audit Notes / Invoice Reference"
            placeholder="e.g. PO-8924 from Reliance Fresh Wholesale"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
        </View>

        <Button
          title="Apply Inventory Transaction"
          onPress={handleAdjust}
          loading={loading}
          leftIcon={<Check size={18} color="#FFFFFF" />}
          style={{ marginBottom: 40 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    backgroundColor: Colors.background,
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
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  typeRowActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  typeLabelActive: {
    color: Colors.primaryDark,
  },
  typeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
