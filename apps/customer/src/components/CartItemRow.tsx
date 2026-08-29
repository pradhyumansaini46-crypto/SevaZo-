import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import { CartItem } from '../types';
import { Plus, Minus, Trash2 } from 'lucide-react-native';

interface CartItemRowProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  style?: ViewStyle;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  style,
}) => {
  const itemTotal = item.price * item.quantity;
  const imageUri =
    item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';

  return (
    <View style={[styles.container, style]}>
      {/* Item Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      </View>

      {/* Item Details */}
      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={styles.title}>
            {item.name}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRemove}
            style={styles.deleteBtn}
          >
            <Trash2 size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {item.variantName ? (
          <Text style={styles.variantText}>{item.variantName}</Text>
        ) : (
          <Text style={styles.variantText}>{item.unit || '1 unit'}</Text>
        )}

        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{itemTotal}</Text>
            <Text style={styles.unitPrice}>₹{item.price} / unit</Text>
          </View>

          {/* Stepper */}
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onDecrement}
              style={styles.stepperBtn}
            >
              <Minus size={14} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onIncrement}
              style={styles.stepperBtn}
            >
              <Plus size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.sm + 4,
    ...Shadows.small,
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  deleteBtn: {
    padding: 4,
  },
  variantText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    ...Typography.priceMedium,
    color: Colors.textPrice,
    marginRight: 6,
  },
  unitPrice: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: Colors.textMuted,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    padding: 4,
  },
  quantityText: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.primary,
    paddingHorizontal: 8,
  },
});
