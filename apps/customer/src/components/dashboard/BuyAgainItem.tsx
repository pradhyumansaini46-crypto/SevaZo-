import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { Product } from '../../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

interface BuyAgainItemProps {
  product: Product;
  quantityInCart: number;
  onPress: () => void;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const BuyAgainItem: React.FC<BuyAgainItemProps> = ({
  product,
  quantityInCart,
  onPress,
  onAdd,
  onIncrement,
  onDecrement,
}) => {
  const handleAdd = () => {
    triggerHaptic('light');
    onAdd();
  };

  const handleIncrement = () => {
    triggerHaptic('light');
    onIncrement();
  };

  const handleDecrement = () => {
    triggerHaptic('light');
    onDecrement();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images?.[0] || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200' }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.infoCol}>
        <Text numberOfLines={1} style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unit}</Text>
        <Text style={styles.price}>₹{product.price}</Text>
      </View>

      <View style={styles.actionContainer}>
        {quantityInCart === 0 ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAdd}
            style={styles.addBtn}
          >
            <Plus size={16} color={Colors.primary} strokeWidth={2.8} />
          </TouchableOpacity>
        ) : (
          <View style={styles.stepper}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDecrement}
              style={styles.stepBtn}
            >
              <Minus size={12} color={Colors.primary} strokeWidth={3} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantityInCart}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleIncrement}
              style={styles.stepBtn}
            >
              <Plus size={12} color={Colors.primary} strokeWidth={3} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 108,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xs + 2,
    marginRight: Spacing.sm,
    alignItems: 'center',
    ...Shadows.small,
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  image: {
    width: '85%',
    height: '85%',
  },
  infoCol: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  unit: {
    ...Typography.bodySmall,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  price: {
    ...Typography.priceSmall,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '800',
    marginTop: 2,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  addBtn: {
    width: '100%',
    height: 28,
    borderRadius: BorderRadius.md,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    width: '100%',
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 4,
  },
  stepBtn: {
    padding: 3,
  },
  qtyText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
  },
});
