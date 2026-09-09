import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Product } from '../../types';
import { Colors, BorderRadius, Shadows, Typography } from '../../theme';
import { Plus, Minus, Zap } from 'lucide-react-native';
import { triggerHaptic } from '../../utils/haptics';

interface CompactProductColumnCardProps {
  product: Product;
  quantityInCart?: number;
  onPress: () => void;
  onAddToCart?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  cardWidth?: number;
}

export const CompactProductColumnCard: React.FC<CompactProductColumnCardProps> = ({
  product,
  quantityInCart = 0,
  onPress,
  onAddToCart,
  onIncrement,
  onDecrement,
  cardWidth = 118,
}) => {
  const discount =
    product.discountPercent ||
    (product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null);

  const imageUri =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, { width: cardWidth }]}
    >
      {/* Top Image Container */}
      <View style={styles.imageBox}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />

        {/* Discount Badge */}
        {discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        ) : null}

        {/* ETA Badge */}
        <View style={styles.etaBadge}>
          <Zap size={9} color="#059669" />
          <Text style={styles.etaText}>{product.deliveryEtaMinutes || 12}m</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.productName}>
          {product.name}
        </Text>

        <Text numberOfLines={1} style={styles.unitText}>
          {product.unit || '1 pack'}
        </Text>

        {/* Price & Add Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceCol}>
            <Text style={styles.priceText}>₹{product.price}</Text>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <Text style={styles.comparePriceText}>₹{product.compareAtPrice}</Text>
            ) : null}
          </View>

          {quantityInCart > 0 ? (
            <View style={styles.stepperWrap}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('light');
                  onDecrement?.();
                }}
                style={styles.stepperBtn}
              >
                <Minus size={10} color={Colors.primary} strokeWidth={3} />
              </TouchableOpacity>
              <Text style={styles.stepperCount}>{quantityInCart}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('light');
                  onIncrement?.();
                }}
                style={styles.stepperBtn}
              >
                <Plus size={10} color={Colors.primary} strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic('medium');
                onAddToCart?.();
              }}
              style={styles.addBtn}
            >
              <Plus size={11} color="#059669" strokeWidth={3} />
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Shadows.small,
  },
  imageBox: {
    width: '100%',
    height: 96,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 6,
  },
  image: {
    width: '85%',
    height: '85%',
  },
  discountBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    zIndex: 2,
  },
  discountText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  etaBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#A7F3D0',
  },
  etaText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#065F46',
    marginLeft: 1,
  },
  content: {
    padding: 7,
  },
  productName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 14,
    height: 28,
  },
  unitText: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceCol: {
    flex: 1,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  comparePriceText: {
    fontSize: 9,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.2,
    borderColor: '#059669',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  addBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
    marginLeft: 2,
    letterSpacing: 0.4,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.2,
    borderColor: '#059669',
    borderRadius: 6,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  stepperBtn: {
    padding: 2,
  },
  stepperCount: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
    paddingHorizontal: 4,
  },
});
