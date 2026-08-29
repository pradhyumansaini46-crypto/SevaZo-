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
import { Product } from '../types';
import { Heart, Plus, Minus, Star, ShoppingBag } from 'lucide-react-native';

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

  const imageUri =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

  if (horizontal) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.horizontalCard, style]}
      >
        <View style={styles.horizontalImageContainer}>
          <Image source={{ uri: imageUri }} style={styles.horizontalImage} resizeMode="cover" />
          {discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.horizontalDetails}>
          <View style={styles.topRow}>
            <Text style={styles.unitText}>{product.unit || '1 unit'}</Text>
            {onToggleWishlist ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onToggleWishlist}
                style={styles.wishlistBtn}
              >
                <Heart
                  size={16}
                  color={isWishlisted ? Colors.heartRed : Colors.textMuted}
                  fill={isWishlisted ? Colors.heartRed : 'transparent'}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <Text numberOfLines={2} style={styles.title}>
            {product.name}
          </Text>

          <View style={styles.ratingRow}>
            <Star size={12} color={Colors.starGold} fill={Colors.starGold} />
            <Text style={styles.ratingText}>
              {product.rating ? product.rating.toFixed(1) : '4.5'}
            </Text>
            {product.reviewsCount ? (
              <Text style={styles.reviewsCount}>({product.reviewsCount})</Text>
            ) : null}
          </View>

          <View style={styles.priceAndActionRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{product.price}</Text>
              {product.compareAtPrice && product.compareAtPrice > product.price ? (
                <Text style={styles.comparePrice}>₹{product.compareAtPrice}</Text>
              ) : null}
            </View>

            {quantityInCart > 0 ? (
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onDecrement}
                  style={styles.stepperBtn}
                >
                  <Minus size={14} color={Colors.textInverse} />
                </TouchableOpacity>
                <Text style={styles.stepperQuantity}>{quantityInCart}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onIncrement}
                  style={styles.stepperBtn}
                >
                  <Plus size={14} color={Colors.textInverse} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onAddToCart}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>ADD</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.gridCard, style]}
    >
      {/* Top Image Box */}
      <View style={styles.gridImageContainer}>
        <Image source={{ uri: imageUri }} style={styles.gridImage} resizeMode="cover" />
        
        {discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        ) : null}

        {onToggleWishlist ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleWishlist}
            style={styles.gridWishlistBtn}
          >
            <Heart
              size={15}
              color={isWishlisted ? Colors.heartRed : Colors.textMuted}
              fill={isWishlisted ? Colors.heartRed : 'transparent'}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Info Section */}
      <View style={styles.gridDetails}>
        <View style={styles.unitRatingRow}>
          <Text style={styles.unitText}>{product.unit || '1 pack'}</Text>
          <View style={styles.ratingBadge}>
            <Star size={10} color={Colors.starGold} fill={Colors.starGold} />
            <Text style={styles.ratingBadgeText}>
              {product.rating ? product.rating.toFixed(1) : '4.5'}
            </Text>
          </View>
        </View>

        <Text numberOfLines={2} style={styles.gridTitle}>
          {product.name}
        </Text>

        <View style={styles.gridFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <Text style={styles.comparePrice}>₹{product.compareAtPrice}</Text>
            ) : null}
          </View>

          {quantityInCart > 0 ? (
            <View style={styles.gridStepperContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onDecrement}
                style={styles.gridStepperBtn}
              >
                <Minus size={12} color={Colors.textInverse} />
              </TouchableOpacity>
              <Text style={styles.gridStepperQuantity}>{quantityInCart}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onIncrement}
                style={styles.gridStepperBtn}
              >
                <Plus size={12} color={Colors.textInverse} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onAddToCart}
              style={styles.gridAddBtn}
            >
              <Text style={styles.gridAddBtnText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Card Layout
  gridCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  gridImageContainer: {
    width: '100%',
    height: 130,
    backgroundColor: Colors.surfaceElevated,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridWishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 6,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.badgeDiscount,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  discountText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '800',
    fontSize: 9,
  },
  gridDetails: {
    padding: Spacing.sm + 2,
  },
  unitRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  unitText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentYellowLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  ratingBadgeText: {
    ...Typography.bodySmall,
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 2,
  },
  gridTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
    minHeight: 36,
    marginBottom: Spacing.xs,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    ...Typography.priceMedium,
    color: Colors.textPrice,
  },
  comparePrice: {
    ...Typography.bodySmall,
    color: Colors.textCompare,
    textDecorationLine: 'line-through',
    marginTop: -2,
  },
  gridAddBtn: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridAddBtnText: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primary,
  },
  gridStepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  gridStepperBtn: {
    padding: 3,
  },
  gridStepperQuantity: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.textInverse,
    paddingHorizontal: 6,
  },

  // Horizontal Card Layout
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  horizontalImageContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalDetails: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wishlistBtn: {
    padding: 4,
  },
  title: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  ratingText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 3,
  },
  reviewsCount: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginLeft: 2,
  },
  priceAndActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  addBtn: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  addBtnText: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepperBtn: {
    padding: 4,
  },
  stepperQuantity: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textInverse,
    paddingHorizontal: 8,
  },
});
