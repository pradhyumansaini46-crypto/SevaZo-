import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import { Product } from '../types';
import { Heart, Plus, Minus, Star, Zap, ShieldCheck, Pill, TrendingDown, Check } from 'lucide-react-native';
import { triggerHaptic } from '../utils/haptics';

interface ProductCardProps {
  product: Product;
  quantityInCart?: number;
  isWishlisted?: boolean;
  onPress: () => void;
  onAddToCart?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onToggleWishlist?: () => void;
  horizontal?: boolean;
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart = 0,
  isWishlisted = false,
  onPress,
  onAddToCart,
  onIncrement,
  onDecrement,
  onToggleWishlist,
  horizontal = false,
  style,
}) => {
  const discount =
    product.discountPercent ||
    (product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null);

  const savings =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice - product.price
      : 0;

  const eta = product.deliveryEtaMinutes || 14;

  const imageUri =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

  const [isJustAdded, setIsJustAdded] = useState(false);

  const handleAdd = () => {
    triggerHaptic('medium');
    setIsJustAdded(true);
    onAddToCart?.();
    setTimeout(() => {
      setIsJustAdded(false);
    }, 400);
  };

  const handleIncrement = () => {
    triggerHaptic('light');
    onIncrement?.();
  };

  const handleDecrement = () => {
    triggerHaptic('light');
    onDecrement?.();
  };

  const handleToggleWishlist = () => {
    triggerHaptic('selection');
    onToggleWishlist?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[horizontal ? styles.horizontalCard : styles.gridCard, style]}
    >
      {/* Top Image Box */}
      <View style={horizontal ? styles.horizontalImageContainer : styles.gridImageContainer}>
        <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="contain" />

        {/* Wishlist Heart Top-Left */}
        {onToggleWishlist ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleWishlist}
            style={styles.wishlistBtn}
          >
            <Heart
              size={15}
              color={isWishlisted ? Colors.heartRed : '#64748B'}
              fill={isWishlisted ? Colors.heartRed : 'transparent'}
            />
          </TouchableOpacity>
        ) : null}

        {/* Offer Badge Top-Right */}
        {discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        ) : null}

        {/* ⚡ Live ETA Pill on Image Bottom */}
        <View style={styles.etaPill}>
          <Zap size={10} color="#047857" fill="#047857" />
          <Text style={styles.etaText}>{eta} min</Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.detailsContainer}>
        {/* Category Adaptive Traits / Trait Badges */}
        <View style={styles.traitBadgesRow}>
          {product.backInStock ? (
            <View style={styles.restockBadge}>
              <Text style={styles.restockBadgeText}>Back in stock</Text>
            </View>
          ) : null}

          {product.priceDrop && product.priceDrop > 0 ? (
            <View style={styles.priceDropBadge}>
              <TrendingDown size={10} color="#16A34A" />
              <Text style={styles.priceDropBadgeText}>↓ ₹{product.priceDrop}</Text>
            </View>
          ) : null}

          {product.prescriptionRequired ? (
            <View style={styles.rxBadge}>
              <Pill size={10} color="#DC2626" />
              <Text style={styles.rxBadgeText}>Rx Required</Text>
            </View>
          ) : null}

          {product.warranty ? (
            <View style={styles.warrantyBadge}>
              <ShieldCheck size={10} color="#4338CA" />
              <Text style={styles.warrantyBadgeText}>{product.warranty}</Text>
            </View>
          ) : null}

          {product.isVeg !== undefined ? (
            <View style={styles.vegIndicator}>
              <View
                style={[
                  styles.vegDot,
                  { backgroundColor: product.isVeg ? '#16A34A' : '#DC2626' },
                ]}
              />
            </View>
          ) : null}

          {product.colorsCount ? (
            <View style={styles.colorsBadge}>
              <Text style={styles.colorsBadgeText}>{product.colorsCount} colours</Text>
            </View>
          ) : null}
        </View>

        {/* Product Title */}
        <Text numberOfLines={2} style={styles.titleText}>
          {product.name}
        </Text>

        {/* Variant & Size / Weight */}
        <Text style={styles.unitText}>{product.unit || '1 unit'}</Text>

        {/* Rating & Reviews */}
        <View style={styles.ratingRow}>
          <Star size={11} color={Colors.starGold} fill={Colors.starGold} />
          <Text style={styles.ratingScore}>
            {product.rating ? product.rating.toFixed(1) : '4.6'}
          </Text>
          <Text style={styles.reviewsCount}>
            ({product.reviewsCount ? (product.reviewsCount > 999 ? `${(product.reviewsCount / 1000).toFixed(1)}k` : product.reviewsCount) : '1.2k'})
          </Text>
        </View>

        {/* Price & Savings */}
        <View style={styles.priceRow}>
          <Text style={styles.sellingPrice}>₹{product.price}</Text>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <Text style={styles.mrpPrice}>₹{product.compareAtPrice}</Text>
          ) : null}
        </View>

        {savings > 0 ? (
          <Text style={styles.savingsText}>Save ₹{savings}</Text>
        ) : (
          <View style={{ height: 14 }} />
        )}

        {/* Seller / Store Name */}
        <Text numberOfLines={1} style={styles.sellerName}>
          {product.storeName || 'FreshMart'}
        </Text>

        {/* Stepper / Add Button Action */}
        <View style={styles.actionContainer}>
          {quantityInCart > 0 ? (
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDecrement}
                style={styles.stepperBtn}
              >
                <Minus size={13} color={Colors.primary} strokeWidth={3} />
              </TouchableOpacity>
              <Text style={styles.stepperQuantity}>{quantityInCart}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleIncrement}
                style={styles.stepperBtn}
              >
                <Plus size={13} color={Colors.primary} strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAdd}
              style={[styles.addBtn, isJustAdded && styles.addBtnSuccess]}
            >
              <Text style={[styles.addBtnText, isJustAdded && styles.addBtnSuccessText]}>
                {isJustAdded ? 'ADDED' : 'ADD'}
              </Text>
              {isJustAdded ? (
                <Check size={14} color="#059669" strokeWidth={3} />
              ) : (
                <Plus size={14} color={Colors.primary} strokeWidth={2.8} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Layout Card
  gridCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  horizontalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Shadows.small,
  },
  gridImageContainer: {
    width: '100%',
    height: 124,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: Spacing.xs,
  },
  horizontalImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: Spacing.xs,
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 5,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
    zIndex: 10,
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    zIndex: 10,
  },
  discountText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '900',
    fontSize: 9,
  },
  etaPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.xs,
  },
  etaText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    marginLeft: 2,
  },
  detailsContainer: {
    padding: Spacing.sm,
  },
  traitBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    minHeight: 14,
  },
  restockBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    marginRight: 4,
  },
  restockBadgeText: {
    ...Typography.caption,
    fontSize: 8,
    fontWeight: '800',
    color: '#2563EB',
  },
  priceDropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    marginRight: 4,
  },
  priceDropBadgeText: {
    ...Typography.caption,
    fontSize: 8,
    fontWeight: '800',
    color: '#16A34A',
    marginLeft: 2,
  },
  rxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    marginRight: 4,
  },
  rxBadgeText: {
    ...Typography.caption,
    fontSize: 8,
    fontWeight: '800',
    color: '#DC2626',
    marginLeft: 2,
  },
  warrantyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    marginRight: 4,
  },
  warrantyBadgeText: {
    ...Typography.caption,
    fontSize: 8,
    fontWeight: '800',
    color: '#4338CA',
    marginLeft: 2,
  },
  vegIndicator: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  colorsBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  colorsBadgeText: {
    ...Typography.caption,
    fontSize: 8,
    color: '#64748B',
  },
  titleText: {
    ...Typography.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 16,
    minHeight: 32,
  },
  unitText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    textTransform: 'none',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingScore: {
    ...Typography.bodySmall,
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 3,
  },
  reviewsCount: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.textMuted,
    marginLeft: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  sellingPrice: {
    ...Typography.priceSmall,
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginRight: 5,
  },
  mrpPrice: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 1,
    textTransform: 'none',
  },
  sellerName: {
    ...Typography.caption,
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 6,
    textTransform: 'none',
  },
  actionContainer: {
    width: '100%',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
  },
  addBtnSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#059669',
  },
  addBtnSuccessText: {
    color: '#059669',
  },
  addBtnText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
    marginRight: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  stepperBtn: {
    padding: 3,
  },
  stepperQuantity: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
  },
});
