import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { RatingStars } from '../../components/RatingStars';
import { Button } from '../../components/Button';
import {
  ArrowLeft,
  Heart,
  Share2,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Plus,
  Minus,
  ShoppingBag,
} from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { Product, ProductVariant, Review } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';

const { width } = Dimensions.get('window');

export const ProductDetailsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const productId = route.params?.productId || 'prod-1';

  const { addItem, incrementItem, decrementItem, getItemQuantity } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    const p = await customerApi.getProductById(productId);
    if (p) {
      setProduct(p);
      if (p.variants && p.variants.length > 0) {
        setSelectedVariant(p.variants[0]);
      }
    }
    const r = await customerApi.getReviews(productId);
    setReviews(r);
  };

  if (!product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentComparePrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.compareAtPrice;

  const discount =
    currentComparePrice && currentComparePrice > currentPrice
      ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
      : product.discountPercent;

  const isWishlisted = isInWishlist(product.id);
  const quantity = getItemQuantity(product.id, selectedVariant?.id);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'];

  return (
    <View style={styles.container}>
      {/* Top Floating App Bar */}
      <View style={[styles.topBar, { top: insets.top > 0 ? insets.top + 8 : Spacing.md }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleWishlist(product)}
            style={styles.circleBtn}
          >
            <Heart
              size={20}
              color={isWishlisted ? Colors.heartRed : Colors.textPrimary}
              fill={isWishlisted ? Colors.heartRed : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={[styles.circleBtn, { marginLeft: Spacing.sm }]}>
            <Share2 size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Carousel */}
        <View style={styles.imageCarouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imgUri, idx) => (
              <Image
                key={idx}
                source={{ uri: imgUri }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          {images.length > 1 ? (
            <View style={styles.dotsRow}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === activeImageIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          ) : null}

          {/* Discount Badge */}
          {discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          ) : null}
        </View>

        {/* Product Info Section */}
        <View style={styles.infoCard}>
          {/* Category & Fast Delivery Badge */}
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {product.categoryName || 'General'}
              </Text>
            </View>
            <View style={styles.speedBadge}>
              <Zap size={12} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.speedBadgeText}>10-15 Mins Delivery</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Rating & Reviews Trigger */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              navigation.navigate('Reviews', {
                productId: product.id,
                productName: product.name,
              })
            }
            style={styles.ratingRow}
          >
            <RatingStars rating={product.rating} showText reviewsCount={product.reviewsCount} />
            <Text style={styles.viewReviewsText}>See all reviews</Text>
            <ChevronRight size={14} color={Colors.primary} />
          </TouchableOpacity>

          {/* Price & Unit */}
          <View style={styles.priceRow}>
            <View style={styles.priceLeft}>
              <Text style={styles.priceText}>₹{currentPrice}</Text>
              {currentComparePrice && currentComparePrice > currentPrice ? (
                <Text style={styles.comparePriceText}>₹{currentComparePrice}</Text>
              ) : null}
            </View>
            <Text style={styles.unitText}>
              ({selectedVariant ? selectedVariant.name : product.unit})
            </Text>
          </View>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 ? (
            <View style={styles.variantsSection}>
              <Text style={styles.variantsTitle}>Select Pack / Size</Text>
              <View style={styles.variantsRow}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedVariant(v)}
                      style={[
                        styles.variantPill,
                        isSelected && styles.variantPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.variantPillText,
                          isSelected && styles.variantPillTextSelected,
                        ]}
                      >
                        {v.name}
                      </Text>
                      <Text
                        style={[
                          styles.variantPillPrice,
                          isSelected && styles.variantPillPriceSelected,
                        ]}
                      >
                        ₹{v.price}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Store / Vendor Info */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              if (product.storeId) {
                navigation.navigate('StoreDetails', {
                  storeId: product.storeId,
                  storeName: product.storeName,
                });
              }
            }}
            style={styles.sellerCard}
          >
            <View style={styles.sellerLeft}>
              <Text style={styles.sellerLabel}>Sold & Dispatched by</Text>
              <Text style={styles.sellerName}>
                {product.storeName || 'Sevazo Express Hub'}
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Guarantees Grid */}
          <View style={styles.guaranteeRow}>
            <View style={styles.guaranteeItem}>
              <Truck size={20} color={Colors.primary} />
              <Text style={styles.guaranteeTitle}>Fast 10m Delivery</Text>
              <Text style={styles.guaranteeSub}>At your doorstep</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <ShieldCheck size={20} color={Colors.secondary} />
              <Text style={styles.guaranteeTitle}>100% Authentic</Text>
              <Text style={styles.guaranteeSub}>Quality inspected</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <RotateCcw size={20} color="#D97706" />
              <Text style={styles.guaranteeTitle}>Instant Returns</Text>
              <Text style={styles.guaranteeSub}>Hassle-free refunds</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.descHeading}>Product Description</Text>
            <Text style={styles.descBody}>{product.description}</Text>
          </View>

          {/* Reviews Preview Snippet */}
          {reviews.length > 0 ? (
            <View style={styles.reviewsPreviewSection}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.descHeading}>Customer Reviews ({reviews.length})</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Reviews', {
                      productId: product.id,
                      productName: product.name,
                    })
                  }
                >
                  <Text style={styles.seeAllReviews}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.reviewSnippetCard}>
                <View style={styles.reviewUserRow}>
                  <Text style={styles.reviewUserName}>{reviews[0].customerName}</Text>
                  <RatingStars rating={reviews[0].rating} size={12} />
                </View>
                <Text style={styles.reviewComment}>{reviews[0].comment}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : Spacing.md,
          },
        ]}
      >
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPriceLabel}>Total Price</Text>
          <Text style={styles.bottomPriceValue}>₹{currentPrice * (quantity || 1)}</Text>
        </View>

        {quantity > 0 ? (
          <View style={styles.bottomStepperContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => decrementItem(product.id)}
              style={styles.bottomStepperBtn}
            >
              <Minus size={18} color={Colors.textInverse} />
            </TouchableOpacity>
            <Text style={styles.bottomStepperQuantity}>{quantity}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => incrementItem(product.id)}
              style={styles.bottomStepperBtn}
            >
              <Plus size={18} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            title="Add to Cart"
            onPress={() => addItem(product, selectedVariant)}
            icon={<ShoppingBag size={18} color={Colors.textInverse} />}
            size="lg"
            style={styles.addToCartBtn}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    position: 'absolute',
    top: Spacing.xl + 10,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageCarouselContainer: {
    width: width,
    height: 320,
    backgroundColor: Colors.surfaceElevated,
    position: 'relative',
  },
  carouselImage: {
    width: width,
    height: 320,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: Colors.primary,
  },
  discountBadge: {
    position: 'absolute',
    bottom: 12,
    left: Spacing.lg,
    backgroundColor: Colors.badgeDiscount,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  discountText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -20,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  categoryBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  speedBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 4,
  },
  productTitle: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewReviewsText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
    marginLeft: Spacing.sm,
    marginRight: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.lg,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: Spacing.sm,
  },
  priceText: {
    ...Typography.priceLarge,
    fontSize: 26,
    color: Colors.textPrice,
    marginRight: Spacing.sm,
  },
  comparePriceText: {
    ...Typography.bodyLarge,
    color: Colors.textCompare,
    textDecorationLine: 'line-through',
  },
  unitText: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  variantsSection: {
    marginBottom: Spacing.lg,
  },
  variantsTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  variantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  variantPill: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  variantPillSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  variantPillText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  variantPillTextSelected: {
    color: Colors.primaryDark,
  },
  variantPillPrice: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  variantPillPriceSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sellerLeft: {
    flex: 1,
  },
  sellerLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  sellerName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  guaranteeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guaranteeItem: {
    alignItems: 'center',
    flex: 1,
  },
  guaranteeTitle: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  guaranteeSub: {
    ...Typography.bodySmall,
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  descSection: {
    marginBottom: Spacing.lg,
  },
  descHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  descBody: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  reviewsPreviewSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  seeAllReviews: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primary,
  },
  reviewSnippetCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewUserName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reviewComment: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.elevated,
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  bottomPriceValue: {
    ...Typography.priceLarge,
    color: Colors.textPrice,
  },
  addToCartBtn: {
    flex: 1.5,
  },
  bottomStepperContainer: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  bottomStepperBtn: {
    padding: Spacing.xs,
  },
  bottomStepperQuantity: {
    ...Typography.titleMedium,
    color: Colors.textInverse,
    fontWeight: '800',
  },
});
