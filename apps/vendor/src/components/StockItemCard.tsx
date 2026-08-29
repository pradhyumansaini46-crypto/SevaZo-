import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Plus, Minus, AlertTriangle } from 'lucide-react-native';
import { Product } from '../types';
import { Colors, BorderRadius, Shadows } from '../theme';
import { Badge } from './Badge';

interface StockItemCardProps {
  product: Product;
  onAdjust: () => void;
  onQuickAdjust?: (delta: number) => void;
}

export const StockItemCard: React.FC<StockItemCardProps> = ({
  product,
  onAdjust,
  onQuickAdjust,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const primaryImg = product.images?.[0]?.url;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        {primaryImg ? (
          <Image source={{ uri: primaryImg }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.sku}>SKU: {product.sku} • ₹{product.price}</Text>
          <View style={styles.badgeRow}>
            {isOutOfStock ? (
              <Badge label="OUT OF STOCK" variant="danger" size="sm" dot />
            ) : isLowStock ? (
              <Badge label={`LOW STOCK (${product.stock})`} variant="warning" size="sm" dot />
            ) : (
              <Badge label={`IN STOCK (${product.stock})`} variant="success" size="sm" dot />
            )}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onQuickAdjust && onQuickAdjust(-1)}
          disabled={product.stock <= 0}
          style={[styles.stepperBtn, product.stock <= 0 && styles.stepperBtnDisabled]}
        >
          <Minus size={16} color={product.stock <= 0 ? Colors.textMuted : Colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onAdjust} style={styles.stockCountBox}>
          <Text style={[styles.stockCount, isOutOfStock && styles.textDanger, isLowStock && styles.textWarning]}>
            {product.stock}
          </Text>
          <Text style={styles.unitText}>{product.unit}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onQuickAdjust && onQuickAdjust(1)}
          style={styles.stepperBtn}
        >
          <Plus size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.borderLight,
  },
  placeholderImage: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 20,
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sku: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stockCountBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
    minWidth: 44,
  },
  stockCount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  unitText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  textDanger: {
    color: Colors.danger,
  },
  textWarning: {
    color: '#B45309',
  },
});
